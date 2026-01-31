import React, { useMemo, useState, useEffect } from 'react';
import { Appointment, AppointmentStatus, User } from '../types';

interface DoctorDashboardProps {
  appointments: Appointment[];
  user: User;
  onUpdateStatus: (id: string, status: AppointmentStatus) => void;
  onUpdateSettings: (maxAppts: number, isClinicClosed: boolean, locationUrl: string) => Promise<void>;
}

const DoctorDashboard: React.FC<DoctorDashboardProps> = ({ appointments, user, onUpdateStatus, onUpdateSettings }) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [maxAppointments, setMaxAppointments] = useState<number>(user.maxAppointmentsPerDay || 20);
  const [locationUrl, setLocationUrl] = useState<string>(user.locationUrl || '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setMaxAppointments(user.maxAppointmentsPerDay || 20);
    setLocationUrl(user.locationUrl || '');
  }, [user]);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  
  const stats = useMemo(() => {
    const pending = appointments.filter(a => a.status === AppointmentStatus.PENDING);
    const todays = appointments.filter(a => (a.status === AppointmentStatus.ACCEPTED || a.status === AppointmentStatus.PENDING) && a.date === todayStr);
    return { pending, todays };
  }, [appointments, todayStr]);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      // التأكد من أن الرابط يبدأ بـ http في حال لم يضفه الطبيب
      let finalUrl = locationUrl.trim();
      if (finalUrl && !finalUrl.startsWith('http')) {
        finalUrl = 'https://' + finalUrl;
      }
      await onUpdateSettings(maxAppointments, user.isClinicClosed || false, finalUrl);
      setIsSettingsOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-10 font-arabic animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/50">
        <div className="text-center md:text-right space-y-2">
           <h2 className="text-2xl sm:text-4xl font-black text-slate-800 tracking-tighter leading-tight">أهلاً د. {user.name} 🩺</h2>
           <p className="text-slate-500 font-bold text-sm sm:text-lg">إدارة المواعيد وكشوفات اليوم</p>
        </div>
        
        <button 
          onClick={() => setIsSettingsOpen(true)}
          className="flex items-center justify-center gap-3 px-8 py-4 bg-slate-50 border border-slate-200 text-slate-700 rounded-2xl font-black text-sm hover:bg-slate-100 hover:border-slate-300 transition-all shadow-sm active:scale-95 group"
        >
          <span className="text-xl group-hover:rotate-90 transition-transform duration-500">⚙️</span>
          إعدادات العيادة
        </button>
      </header>

      {/* نافذة الإعدادات المنبثقة */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="bg-indigo-600 p-8 text-white">
              <h3 className="text-2xl font-black">إعدادات عيادتك ⚙️</h3>
              <p className="text-indigo-100 text-sm mt-1 font-bold">خصص نظام الحجز والموقع الجغرافي</p>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-black text-slate-700 mr-1">السعة اليومية للمواعيد</label>
                <div className="flex items-center gap-4">
                  <input 
                    type="range" 
                    min="1" 
                    max="50" 
                    value={maxAppointments}
                    onChange={(e) => setMaxAppointments(Number(e.target.value))}
                    className="flex-1 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <span className="w-12 h-12 flex items-center justify-center bg-indigo-50 text-indigo-600 rounded-xl font-black">{maxAppointments}</span>
                </div>
                <p className="text-[10px] text-slate-400 font-bold">أقصى عدد مرضى يمكنهم الحجز في يوم واحد</p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-black text-slate-700 mr-1">رابط الموقع (Google Maps)</label>
                <input 
                  type="url" 
                  placeholder="انسخ الرابط من خرائط جوجل هنا..."
                  value={locationUrl}
                  onChange={(e) => setLocationUrl(e.target.value)}
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-left font-mono text-sm text-indigo-600 outline-none focus:ring-4 focus:ring-indigo-50 transition-all"
                />
                <p className="text-[10px] text-slate-400 font-bold">هذا الرابط سيظهر للمرضى لتسهيل وصولهم للعيادة</p>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setIsSettingsOpen(false)}
                  className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black hover:bg-slate-200 transition-all"
                >
                  إلغاء
                </button>
                <button 
                  onClick={handleSaveSettings}
                  disabled={isSaving}
                  className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50"
                >
                  {isSaving ? 'جاري الحفظ...' : 'حفظ التغييرات ✨'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10">
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
