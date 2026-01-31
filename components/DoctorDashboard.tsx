import React, { useMemo, useState, useEffect } from 'react';
import { Appointment, AppointmentStatus, User } from '../types';

interface DoctorDashboardProps {
  appointments: Appointment[];
  user: User;
  onUpdateStatus: (id: string, status: AppointmentStatus) => void;
  onUpdateSettings: (maxAppts: number, isClinicClosed: boolean) => Promise<void>;
}

const DoctorDashboard: React.FC<DoctorDashboardProps> = ({ appointments, user, onUpdateStatus, onUpdateSettings }) => {
  const [maxAppointments, setMaxAppointments] = useState<number>(user.maxAppointmentsPerDay || 20);
  const [isSaving, setIsSaving] = useState(false);

  // تحديث القيمة المحلية عند تغير بيانات المستخدم من الأب
  useEffect(() => {
    if (user.maxAppointmentsPerDay) {
      setMaxAppointments(user.maxAppointmentsPerDay);
    }
  }, [user.maxAppointmentsPerDay]);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  
  const stats = useMemo(() => {
    const pending = appointments.filter(a => a.status === AppointmentStatus.PENDING);
    const todays = appointments.filter(a => (a.status === AppointmentStatus.ACCEPTED || a.status === AppointmentStatus.PENDING) && a.date === todayStr);
    return { pending, todays };
  }, [appointments, todayStr]);

  const handleSaveCapacity = async () => {
    setIsSaving(true);
    try {
      // نرسل القيمة الجديدة مع الحفاظ على حالة العيادة الحالية
      await onUpdateSettings(maxAppointments, user.isClinicClosed || false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-10 font-arabic animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">
      {/* Header & Stats */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/50">
        <div className="text-center md:text-right space-y-2">
           <h2 className="text-2xl sm:text-4xl font-black text-slate-800 tracking-tighter leading-tight">أهلاً د. {user.name} 🩺</h2>
           <p className="text-slate-500 font-bold text-sm sm:text-lg">إدارة المواعيد والطاقة الاستيعابية</p>
        </div>
        
        {/* Capacity Setting Box - الميزة الجديدة */}
        <div className="bg-slate-50 p-4 rounded-3xl border border-slate-200 flex flex-col sm:flex-row items-center gap-4">
          <div className="text-right">
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">عدد مواعيد اليوم</label>
            <input 
              type="number" 
              value={maxAppointments}
              onChange={(e) => setMaxAppointments(Number(e.target.value))}
              className="w-20 p-2 bg-white border border-slate-200 rounded-xl text-center font-black text-blue-600 outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <button 
            onClick={handleSaveCapacity}
            disabled={isSaving}
            className={`px-6 py-3 rounded-2xl font-black text-xs transition-all shadow-lg ${
              isSaving ? 'bg-slate-300 text-slate-500' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100'
            }`}
          >
            {isSaving ? 'جاري الحفظ...' : 'تحديث السعة'}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10">
        {/* Daily Schedule Section */}
        <section className="bg-white rounded-[2rem] sm:rounded-[3rem] border border-slate-100 p-6 sm:p-10 shadow-xl relative overflow-hidden">
           <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl sm:text-2xl font-black text-slate-800 flex items-center gap-3">
                 <span className="w-2 h-6 bg-blue-600 rounded-full"></span>
                 كشوفات اليوم
              </h3>
              <div className="flex flex-col items-end">
                <span className="text-[10px] bg-slate-50 px-3 py-1 rounded-full font-black text-slate-400 border border-slate-100">{todayStr}</span>
                <span className="text-[9px] text-blue-500 font-black mt-1">السعة: {user.maxAppointmentsPerDay} موعد</span>
              </div>
           </div>
           
           {stats.todays.length === 0 ? (
              <div className="py-20 text-center">
                 <div className="text-4xl mb-4">🗓️</div>
                 <p className="text-slate-400 font-black">لا توجد مواعيد مجدولة لهذا اليوم</p>
              </div>
           ) : (
              <div className="space-y-4">
                  {stats.todays.map((appt) => (
                      <div key={appt.id} className="p-5 border border-slate-50 bg-slate-50/50 rounded-2xl flex justify-between items-center group hover:bg-white hover:shadow-lg transition-all border-r-4 border-r-blue-600">
                          <div className="flex items-center gap-4 text-right">
                              <div className="bg-white w-12 h-12 rounded-xl shadow-sm flex flex-col items-center justify-center border border-blue-50">
                                 <span className="font-black text-lg">#{appt.time}</span>
                              </div>
                              <div>
                                <p className="font-black text-slate-800">{appt.patientName}</p>
                                <p className="text-[10px] text-slate-400 font-bold">{appt.status === AppointmentStatus.PENDING ? 'قيد الانتظار' : 'موعد مؤكد'}</p>
                              </div>
                          </div>
                          {appt.status !== AppointmentStatus.COMPLETED && (
                            <button 
                              onClick={() => onUpdateStatus(appt.id, AppointmentStatus.COMPLETED)} 
                              className="px-4 py-2 bg-green-600 text-white rounded-lg text-xs font-black hover:bg-green-700 shadow-md shadow-green-100 transition-all active:scale-95"
                            >
                                إتمام
                            </button>
                          )}
                      </div>
                  ))}
              </div>
           )}
        </section>

        {/* Pending Requests Section */}
        <section className="bg-white rounded-[2rem] sm:rounded-[3rem] border border-slate-100 p-6 sm:p-10 shadow-xl relative overflow-hidden">
            <h3 className="text-xl sm:text-2xl font-black text-slate-800 mb-8 flex items-center gap-3">
               <span className="w-2 h-6 bg-amber-600 rounded-full"></span>
               طلبات الحجز الجديدة
            </h3>
            {stats.pending.length === 0 ? (
              <div className="py-20 text-center">
                 <div className="text-4xl mb-4">✨</div>
                 <p className="text-slate-400 font-black">جميع الطلبات تمت معالجتها</p>
              </div>
            ) : (
              <div className="space-y-4">
                {stats.pending.map(appt => (
                  <div key={appt.id} className="p-5 border border-slate-100 rounded-2xl bg-white hover:border-indigo-200 transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div className="text-right">
                        <p className="font-black text-lg text-slate-800 leading-none">{appt.patientName}</p>
                        <p className="text-[10px] text-slate-400 font-black mt-2">📅 {appt.date} | 🔢 دور {appt.time}</p>
                      </div>
                      <span className="bg-amber-50 text-amber-600 text-[9px] font-black px-2 py-1 rounded-md">طلب جديد</span>
                    </div>
                    
                    {appt.notes && (
                      <p className="text-[11px] text-slate-500 bg-slate-50 p-3 rounded-lg mb-4 italic">"{appt.notes}"</p>
                    )}

                    <div className="flex gap-2">
                      <button 
                        onClick={() => onUpdateStatus(appt.id, AppointmentStatus.REJECTED)} 
                        className="flex-1 py-2.5 bg-red-50 text-red-600 rounded-xl text-xs font-black border border-red-100 hover:bg-red-100 transition-colors"
                      >
                        رفض
                      </button>
                      <button 
                        onClick={() => onUpdateStatus(appt.id, AppointmentStatus.ACCEPTED)} 
                        className="flex-2 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95"
                      >
                        قبول الموعد
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
        </section>
      </div>
    </div>
  );
};

export default DoctorDashboard;
