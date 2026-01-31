import React, { useState, useMemo, useEffect } from 'react';
import { Appointment, AppointmentStatus, User } from '../types';
import { supabase } from '../services/supabaseClient';

interface PatientDashboardProps {
  appointments: Appointment[];
  doctors: User[];
  onBook: (appt: any) => Promise<boolean>;
  onReview: (doctorId: string, rating: number, comment: string) => Promise<void>;
  user: User;
  onRefresh: () => Promise<void>;
}

const generateDays = () => {
  const days = [];
  const start = new Date();
  for (let i = 0; i < 14; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d);
  }
  return days;
};

const PatientDashboard: React.FC<PatientDashboardProps> = ({ appointments, doctors, onBook, user }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ date: '', queueNumber: '', notes: '' });
  const [busySlots, setBusySlots] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const currentDoctor = useMemo(() => 
    doctors.find(d => d.id === selectedDoctorId), 
    [doctors, selectedDoctorId]
  );

  useEffect(() => {
    if (showModal && selectedDoctorId) {
      const fetchBusy = async () => {
        try {
          const docId = Number(selectedDoctorId);
          const { data, error } = await supabase.from('appointments')
            .select('appointment_date, appointment_time')
            .eq('doctor_id', docId)
            .neq('status', 'rejected');
          
          if (error) throw error;
          if (data) {
            setBusySlots(new Set(data.map((a: any) => `${a.appointment_date}_${a.appointment_time}`)));
          }
        } catch (err) {
          console.error("Error fetching busy slots:", err);
        }
      };
      fetchBusy();
    }
  }, [showModal, selectedDoctorId, formData.date]);

  const days = useMemo(() => generateDays(), []);
  const filteredDoctors = doctors.filter(d => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    d.specialty?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBookSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!currentDoctor || !formData.date || !formData.queueNumber) {
      alert("يرجى اختيار التاريخ ورقم الدور");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const success = await onBook({
        patientId: user.id,
        doctorId: currentDoctor.id,
        date: formData.date,
        time: formData.queueNumber,
        notes: formData.notes
      });
      
      if (success) {
        setShowSuccess(true);
        setTimeout(() => { 
          setShowSuccess(false); 
          setShowModal(false); 
          setFormData({ date: '', queueNumber: '', notes: '' }); 
          setSelectedDoctorId(null);
        }, 2000);
      }
    } catch (err) {
      console.error("Booking error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-10 font-arabic animate-in fade-in duration-700 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white p-6 sm:p-8 rounded-[2rem] border border-slate-100 shadow-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 -mr-16 -mt-16 rounded-full"></div>
        <div className="text-right flex flex-col sm:flex-row items-center gap-6 relative z-10 w-full">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[1.5rem] overflow-hidden border-4 border-blue-50">
             <img src={user.avatar} className="w-full h-full object-cover" alt={user.name} />
          </div>
          <div className="text-center sm:text-right">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800">مرحباً، {user.name} 👋</h2>
            <p className="text-slate-500 font-bold mt-1 text-sm sm:text-lg">نحن هنا لخدمتك، ابدأ رحلة علاجك الآن</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
        <div className="lg:col-span-4 space-y-6 order-2 lg:order-1">
           <h3 className="text-xl sm:text-2xl font-black text-slate-800 flex items-center gap-3">
             <span className="w-2 h-6 sm:h-8 bg-blue-600 rounded-full"></span>
             مواعيدك
           </h3>
           <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-1">
             {appointments.length === 0 ? (
               <div className="bg-white p-12 rounded-[2rem] border-2 border-dashed border-slate-100 text-center text-slate-400 font-bold">
                 لا توجد مواعيد حالياً
               </div>
             ) : (
               appointments.map(a => (
                 <div key={a.id} className="bg-white p-5 rounded-[1.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all border-r-4 border-r-blue-500">
                    <div className="flex justify-between items-center mb-3">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black ${
                        a.status === AppointmentStatus.ACCEPTED ? 'bg-green-100 text-green-700' : 
                        a.status === AppointmentStatus.REJECTED ? 'bg-red-100 text-red-700' : 
                        a.status === AppointmentStatus.COMPLETED ? 'bg-blue-50 text-blue-600 border border-blue-100' : 
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {a.status === AppointmentStatus.ACCEPTED ? 'مؤكد' : 
                         a.status === AppointmentStatus.REJECTED ? 'مرفوض' : 
                         a.status === AppointmentStatus.COMPLETED ? 'انتهى الكشف' : 
                         'قيد المراجعة'}
                      </span>
                      <div className="font-black text-blue-600">دور #{a.time}</div>
                    </div>
                    <p className="font-black text-slate-800">{a.doctorName}</p>
                    <p className="text-xs text-slate-400 font-bold mt-1 flex items-center gap-1">
                      📅 {a.date}
                    </p>
                 </div>
               ))
             )}
           </div>
        </div>

        <div className="lg:col-span-8 space-y-6 order-1 lg:order-2">
           <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
             <h3 className="text-xl sm:text-2xl font-black text-slate-800 flex items-center gap-3">
               <span className="w-2 h-6 sm:h-8 bg-indigo-600 rounded-full"></span>
               اختر طبيبك
             </h3>
             <div className="relative w-full sm:w-72">
               <input 
                  type="text" 
                  placeholder="بحث عن طبيب أو تخصص..." 
                  className="w-full py-3 px-10 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 text-right font-bold" 
                  value={searchQuery} 
                  onChange={e => setSearchQuery(e.target.value)} 
               />
               <svg className="w-4 h-4 absolute left-4 top-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeWidth="2.5" /></svg>
             </div>
           </div>
           
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
             {filteredDoctors.map(d => (
               <div key={d.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-lg hover:shadow-2xl transition-all duration-300 group flex flex-col">
                 <div className="flex items-start gap-5">
                    <img src={d.avatar} className="w-20 h-20 rounded-2xl border-2 border-slate-50 object-cover" alt={d.name} />
                    <div className="flex-1 text-right">
                      <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-3 py-1 rounded-full uppercase">{d.specialty || 'طبيب عام'}</span>
                      <h4 className="font-black text-xl text-slate-800 mt-2">{d.name}</h4>
                      <p className="text-slate-400 text-xs font-bold mt-1">عيادة مختصة</p>
                    </div>
                 </div>
                 <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between flex-1">
                    <div className="text-right">
                       <p className="text-[10px] text-slate-400 font-black">السعة اليومية</p>
                       <p className="text-sm font-black text-indigo-600">{d.maxAppointmentsPerDay || 20} حالة</p>
                    </div>
                    <div className="flex items-center gap-2">
                       {d.locationUrl && (
                         <a 
                           href={d.locationUrl} 
                           target="_blank" 
                           rel="noopener noreferrer"
                           title="عرض الموقع على خرائط جوجل"
                           className="flex items-center justify-center w-12 h-12 bg-green-50 text-green-600 hover:bg-green-600 hover:text-white rounded-2xl font-black text-sm transition-all active:scale-95 shadow-sm shadow-green-100"
                         >
                           <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                         </a>
                       )}
                       <button 
                          onClick={() => { setSelectedDoctorId(d.id); setShowModal(true); }} 
                          className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-8 rounded-2xl font-black text-sm transition-all active:scale-95 shadow-lg shadow-indigo-100"
                       >
                          احجز الآن
                       </button>
                    </div>
                 </div>
               </div>
             ))}
           </div>
        </div>
      </div>

      {showModal && currentDoctor && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-10">
            <div className="bg-indigo-600 p-6 text-white flex justify-between items-center">
              <h3 className="text-xl font-black">حجز موعد مع {currentDoctor.name}</h3>
              <button onClick={() => setShowModal(false)} className="text-2xl font-bold opacity-70 hover:opacity-100">×</button>
            </div>

            <div className="p-8 overflow-y-auto max-h-[70vh] bg-slate-50">
              {showSuccess ? (
                <div className="py-10 text-center space-y-4">
                  <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto text-3xl">✓</div>
                  <h3 className="text-2xl font-black">تم إرسال الطلب!</h3>
                  <p className="text-slate-500 font-bold">تابع حالة الحجز في قائمة مواعيدك.</p>
                </div>
              ) : (
                <form className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-sm font-black text-slate-700 block">اختر التاريخ</label>
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                      {days.map(d => {
                        const iso = d.toISOString().split('T')[0];
                        const active = formData.date === iso;
                        return (
                          <button 
                            key={iso} type="button" 
                            onClick={() => setFormData({...formData, date: iso, queueNumber: ''})}
                            className={`flex-shrink-0 p-4 rounded-2xl border-2 text-center transition-all min-w-[80px] ${
                              active ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' : 'bg-white text-slate-500 border-slate-100'
                            }`}
                          >
                            <p className="text-[10px] font-black opacity-60">{d.toLocaleDateString('ar-EG', {weekday: 'short'})}</p>
                            <p className="font-black text-lg">{d.getDate()}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {formData.date && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-black text-slate-700 block">رقم الدور (المتاح بناءً على سعة العيادة)</label>
                        <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-2 py-1 rounded-md">السعة: {currentDoctor.maxAppointmentsPerDay}</span>
                      </div>
                      <div className="grid grid-cols-5 gap-2">
                         {Array.from({length: currentDoctor.maxAppointmentsPerDay || 20}, (_, i) => i + 1).map(num => {
                           const taken = busySlots.has(`${formData.date}_${num}`);
                           const selected = formData.queueNumber === num.toString();
                           return (
                             <button 
                               key={num} type="button" disabled={taken} 
                               onClick={() => setFormData({...formData, queueNumber: num.toString()})}
                               className={`h-10 rounded-xl border-2 font-black text-xs transition-all ${
                                  taken ? 'bg-slate-100 text-slate-300 border-slate-50 cursor-not-allowed' : 
                                  selected ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-slate-700 border-slate-100 hover:border-blue-200'
                               }`}
                             >
                               {num}
                             </button>
                           );
                         })}
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                     <label className="text-sm font-black text-slate-700 block">ملاحظات للطبيب</label>
                     <textarea 
                        className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-sm font-bold outline-none h-24 resize-none" 
                        placeholder="اختياري: اشرح حالتك باختصار..." 
                        value={formData.notes} 
                        onChange={e => setFormData({...formData, notes: e.target.value})} 
                     />
                  </div>
                </form>
              )}
            </div>

            {!showSuccess && (
              <div className="p-6 bg-white border-t border-slate-100">
                <button 
                  onClick={handleBookSubmit}
                  disabled={!formData.queueNumber || isSubmitting} 
                  className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl transition-all disabled:opacity-30 active:scale-95"
                >
                  {isSubmitting ? 'جاري الإرسال...' : 'تأكيد الحجز الآن'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;
