import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from './services/supabaseClient';
import { UserRole, User, Appointment, AppointmentStatus, Message } from './types';

import Auth from './components/Auth';
import Navbar from './components/Navbar';
import PatientDashboard from './components/PatientDashboard';
import DoctorDashboard from './components/DoctorDashboard';
import ChatCenter from './components/ChatCenter';
import RegisterPatient from './components/RegisterPatient';
import RegisterDoctor from './components/RegisterDoctor';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'AUTH' | 'REGISTER_PATIENT' | 'REGISTER_DOCTOR' | 'APP'>('AUTH');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<User[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [patientContacts, setPatientContacts] = useState<User[]>([]);

  const fetchDoctors = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('doctors').select('*');
      if (error) throw error;
      if (data) {
        setDoctors(data.map((d: any) => ({
          id: d.id.toString(),
          name: d.full_name,
          role: 'DOCTOR' as UserRole,
          specialty: d.specialty,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(d.full_name)}&background=312e81&color=fff`,
          maxAppointmentsPerDay: d.max_appointments_per_day || 20,
          isClinicClosed: d.is_clinic_closed || false
        })));
      }
    } catch (e) {
      console.error("Error fetching doctors", e);
    }
  }, []);

  const fetchPatientContacts = useCallback(async () => {
    if (!user || user.role !== 'DOCTOR') return;
    try {
      const doctorId = user.id;
      
      const { data: apptPatients, error: apptError } = await supabase
        .from('appointments')
        .select('patient_id, patient_name')
        .eq('doctor_id', doctorId);

      const { data: msgPatients, error: msgError } = await supabase
        .from('messages')
        .select('sender_id')
        .eq('receiver_id', doctorId);

      if (apptError || msgError) return;

      const uniquePatientIds = new Set([
        ...(apptPatients?.map(p => p.patient_id) || []),
        ...(msgPatients?.map(p => p.sender_id) || [])
      ]);

      if (uniquePatientIds.size > 0) {
        const { data: patientsData, error: patientsError } = await supabase
          .from('patients')
          .select('*')
          .in('id', Array.from(uniquePatientIds));

        if (patientsError) throw patientsError;
        if (patientsData) {
          setPatientContacts(patientsData.map((p: any) => ({
            id: p.id.toString(),
            name: p.full_name,
            role: 'PATIENT' as UserRole,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(p.full_name)}&background=3b82f6&color=fff`
          })));
        }
      }
    } catch (e) {
      console.error("Error fetching patient contacts", e);
    }
  }, [user]);

  const fetchAppointments = useCallback(async () => {
    if (!user) return;
    try {
      const isPatient = user.role === 'PATIENT';
      const userId = user.id;
      
      const { data, error } = await supabase.from('appointments').select('*')
        .eq(isPatient ? 'patient_id' : 'doctor_id', userId)
        .order('appointment_date', { ascending: false });
      
      if (error) throw error;
      if (data) {
        setAppointments(data.map((a: any) => ({
          id: a.id.toString(),
          patientId: a.patient_id.toString(),
          doctorId: a.doctor_id.toString(),
          patientName: a.patient_name || 'مريض',
          doctorName: a.doctor_name || 'طبيب',
          date: a.appointment_date,
          time: a.appointment_time,
          status: (a.status || 'pending').toUpperCase() as AppointmentStatus,
          notes: a.notes || ''
        })));
        if (user.role === 'DOCTOR') fetchPatientContacts();
      }
    } catch (e) {
      console.error("Error fetching appointments", e);
    }
  }, [user, fetchPatientContacts]);

  const fetchMessages = useCallback(async () => {
    if (!user) return;
    try {
      const userId = user.id;
      const { data, error } = await supabase.from('messages').select('*')
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .order('created_at', { ascending: true });
      if (error) throw error;
      if (data) {
        setMessages(data.map((m: any) => ({
          id: m.id.toString(),
          senderId: m.sender_id.toString(),
          receiverId: m.receiver_id.toString(),
          content: m.content,
          createdAt: m.created_at
        })));
        if (user.role === 'DOCTOR') fetchPatientContacts();
      }
    } catch (e) {
      console.error("Error fetching messages", e);
    }
  }, [user, fetchPatientContacts]);

  useEffect(() => {
    if (user) {
      fetchDoctors();
      fetchAppointments();
      fetchMessages();
      if (user.role === 'DOCTOR') fetchPatientContacts();
      
      const channel = supabase.channel('realtime_all_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => {
          fetchAppointments();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => {
          fetchMessages();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'doctors' }, () => {
          fetchDoctors();
        })
        .subscribe();
      
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, fetchDoctors, fetchAppointments, fetchMessages, fetchPatientContacts]);

  const handleBook = async (appt: any) => {
    try {
      const doc = doctors.find(d => d.id === appt.doctorId.toString());

      const { error } = await supabase.from('appointments').insert([{
        patient_id: appt.patientId,
        doctor_id: appt.doctorId,
        appointment_date: appt.date,
        appointment_time: appt.time.toString(),
        status: 'pending',
        notes: appt.notes || '',
        patient_name: user?.name,
        doctor_name: doc?.name || 'طبيب'
      }]);

      if (error) {
        alert("فشل الحجز: " + error.message);
        return false;
      }

      await fetchAppointments();
      return true;
    } catch (err) {
      return false;
    }
  };

  const handleUpdateStatus = async (id: string, status: AppointmentStatus) => {
    const { error } = await supabase
      .from('appointments')
      .update({ status: status.toLowerCase() })
      .eq('id', id);
      
    if (error) {
      alert("فشل تحديث الحالة: " + error.message);
    } else {
      fetchAppointments();
    }
  };

  const handleUpdateDoctorSettings = async (max: number, isClinicClosed: boolean) => {
    if (!user) return;
    try {
      const { error } = await supabase.from('doctors').update({
        max_appointments_per_day: max,
        is_clinic_closed: isClinicClosed
      }).eq('id', user.id);

      if (error) {
        throw error;
      }

      setUser({ ...user, maxAppointmentsPerDay: max, isClinicClosed: isClinicClosed });
      alert("تم حفظ إعدادات العيادة بنجاح ✨");
      await fetchDoctors();
    } catch (err: any) {
      console.error("Update Settings Error:", err);
      alert("فشل حفظ الإعدادات: " + (err.message || "حدث خطأ أثناء التحديث"));
    }
  };

  const handleSendMessage = async (text: string, receiverId: string) => {
    if (!user) return;
    const { error } = await supabase.from('messages').insert([{
      sender_id: user.id,
      receiver_id: receiverId,
      content: text
    }]);
    if (error) {
      alert("فشل إرسال الرسالة: " + error.message);
    }
  };

  const availableDoctors = useMemo(() => doctors.filter(d => !d.isClinicClosed), [doctors]);

  if (view === 'AUTH') {
    return (
      <Auth 
        onLogin={(role, data) => { setUser(data); setView('APP'); }} 
        onRegisterClick={() => setView('REGISTER_PATIENT')} 
        onDoctorRegisterClick={() => setView('REGISTER_DOCTOR')} 
      />
    );
  }

  if (view === 'REGISTER_PATIENT') {
    return <RegisterPatient onBack={() => setView('AUTH')} onSuccess={d => { setUser(d); setView('APP'); }} />;
  }

  if (view === 'REGISTER_DOCTOR') {
    return <RegisterDoctor onBack={() => setView('AUTH')} onSuccess={d => { setUser(d); setView('APP'); }} />;
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-arabic" dir="rtl">
      <Navbar user={user} onLogout={() => { setUser(null); setView('AUTH'); setPatientContacts([]); }} />
      <main className="flex-1 container mx-auto p-4 md:p-6 max-w-6xl animate-in fade-in duration-500">
        {user.role === 'PATIENT' ? (
          <PatientDashboard 
            appointments={appointments} 
            doctors={availableDoctors} 
            onBook={handleBook} 
            onReview={async () => {}} 
            user={user} 
            onRefresh={fetchAppointments} 
          />
        ) : (
          <DoctorDashboard 
            appointments={appointments} 
            user={user} 
            onUpdateStatus={handleUpdateStatus} 
            onUpdateSettings={handleUpdateDoctorSettings} 
          />
        )}
      </main>
      <ChatCenter 
        user={user} 
        messages={messages} 
        contacts={user.role === 'PATIENT' ? availableDoctors : patientContacts} 
        onSendMessage={handleSendMessage} 
      />
    </div>
  );
};

export default App;
