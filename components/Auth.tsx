import React, { useState } from 'react';
import { UserRole } from '../types';
import { supabase } from '../services/supabaseClient';

interface AuthProps {
  onLogin: (role: UserRole, userData?: any) => void;
  onRegisterClick: () => void;
  onDoctorRegisterClick: () => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin, onRegisterClick, onDoctorRegisterClick }) => {
  const [step, setStep] = useState<'CHOICE' | 'PATIENT_LOGIN' | 'DOCTOR_LOGIN'>('CHOICE');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePatientLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { data, error: dbError } = await supabase
        .from('patients')
        .select('*')
        .eq('phone_number', phone)
        .eq('password', password)
        .single();

      if (dbError || !data) {
        setError('خطأ في رقم الهاتف أو كلمة المرور.');
      } else {
        onLogin('PATIENT', { 
          id: data.id.toString(), 
          name: data.full_name, 
          role: 'PATIENT', 
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.full_name)}&background=3b82f6&color=fff` 
        });
      }
    } catch (err) {
      setError('حدث خطأ أثناء الاتصال بالخادم.');
    } finally {
      setLoading(false);
    }
  };

  const handleDoctorLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { data, error: dbError } = await supabase
        .from('doctors')
        .select('*')
        .eq('email', email)
        .eq('password', password)
        .single();

      if (dbError || !data) {
        setError('خطأ في البريد الإلكتروني أو كلمة المرور.');
      } else {
        onLogin('DOCTOR', { 
          id: data.id.toString(), 
          name: data.full_name, 
          role: 'DOCTOR', 
          specialty: data.specialty, 
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.full_name)}&background=312e81&color=fff`,
          maxAppointmentsPerDay: data.max_appointments_per_day,
          isClinicClosed: data.is_clinic_closed || false
        });
      }
    } catch (err) {
      setError('حدث خطأ أثناء الاتصال بالخادم.');
    } finally {
      setLoading(false);
    }
  };

  const ContactFooter = () => (
    <div className="w-full max-w-4xl mt-12 pt-8 border-t border-slate-200/50">
      <h4 className="text-slate-800 font-black text-center mb-8 text-xl">تواصل معنا</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <a href="tel:0654235524" className="flex flex-col items-center p-6 bg-white/50 backdrop-blur-sm rounded-[2.5rem] border border-white hover:border-blue-200 hover:shadow-lg transition-all group">
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-2xl group-hover:bg-blue-600 group-hover:text-white transition-all mb-3 shadow-sm">📞</div>
          <span className="text-[10px] text-slate-400 font-black mb-1">اتصل بنا / الدعم الفني</span>
          <span className="text-lg font-black text-slate-700">0654235524</span>
        </a>
        
        <a href="https://www.instagram.com/shifaa_bridge?igsh=N2tncXFudjg1azhm" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center p-6 bg-white/50 backdrop-blur-sm rounded-[2.5rem] border border-white hover:border-pink-200 hover:shadow-lg transition-all group">
          <div className="w-14 h-14 bg-pink-50 rounded-2xl flex items-center justify-center text-2xl group-hover:bg-gradient-to-tr group-hover:from-yellow-400 group-hover:via-pink-500 group-hover:to-purple-600 group-hover:text-white transition-all mb-3 shadow-sm">📸</div>
          <span className="text-[10px] text-slate-400 font-black mb-1">تابعنا على إنستغرام</span>
          <span className="text-lg font-black text-slate-700">shifaa_bridge</span>
        </a>

        <div className="flex flex-col items-center p-6 bg-white/50 backdrop-blur-sm rounded-[2.5rem] border border-white hover:border-slate-200 hover:shadow-lg transition-all group">
          <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-2xl group-hover:bg-slate-600 group-hover:text-white transition-all mb-3 shadow-sm">📍</div>
          <span className="text-[10px] text-slate-400 font-black mb-1">الموقع</span>
          <span className="text-sm font-black text-slate-700 text-center leading-relaxed">نحن منصة رقمية متاحون دائماً</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-50 via-white to-indigo-50 font-arabic overflow-y-auto">
      {step === 'CHOICE' ? (
        <div className="max-w-md w-full space-y-12 text-center animate-in fade-in zoom-in duration-500 py-10">
          <div className="space-y-4">
            <div className="w-24 h-24 bg-blue-600 rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl shadow-blue-200 rotate-3 hover:rotate-0 transition-transform duration-300">
               <span className="text-white text-5xl font-black">ج</span>
            </div>
            <h1 className="text-5xl font-black text-slate-800 tracking-tighter">جسر الشفاء</h1>
            <p className="text-slate-500 font-medium text-lg">بوابتك الرقمية الآمنة للتواصل الطبي المباشر</p>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            <button 
              onClick={() => setStep('PATIENT_LOGIN')} 
              className="group p-8 bg-white border border-slate-100 rounded-[3rem] shadow-xl hover:shadow-2xl hover:scale-[1.03] transition-all duration-300 text-right flex items-center gap-6"
            >
              <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center text-4xl group-hover:bg-blue-600 group-hover:text-white group-hover:rotate-6 transition-all duration-500 shadow-inner">👤</div>
              <div className="flex-1">
                <h3 className="font-black text-2xl text-slate-800 mb-1">أنا مريض</h3>
                <p className="text-sm text-slate-400 font-medium leading-relaxed">احجز موعدك بضغطة زر وتواصل مع طبيبك المفضل</p>
              </div>
            </button>
            
            <button 
              onClick={() => setStep('DOCTOR_LOGIN')} 
              className="group p-8 bg-white border border-slate-100 rounded-[3rem] shadow-xl hover:shadow-2xl hover:scale-[1.03] transition-all duration-300 text-right flex items-center gap-6"
            >
              <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center text-4xl group-hover:bg-indigo-600 group-hover:text-white group-hover:-rotate-6 transition-all duration-500 shadow-inner">👨‍⚕️</div>
              <div className="flex-1">
                <h3 className="font-black text-2xl text-slate-800 mb-1">أنا طبيب</h3>
                <p className="text-sm text-slate-400 font-medium leading-relaxed">أدر عيادتك الرقمية بذكاء ونظم مواعيد مرضاك بسهولة</p>
              </div>
            </button>
          </div>
        </div>
      ) : (
        <div className="max-w-md w-full space-y-10 animate-in slide-in-from-bottom-10 duration-500 py-10">
          <button 
            onClick={() => setStep('CHOICE')} 
            className="flex items-center gap-3 text-slate-400 hover:text-blue-600 font-black transition-all group mr-2"
          >
            <span className="text-2xl group-hover:translate-x-1 transition-transform">→</span> 
            <span>العودة للاختيار</span>
          </button>
          
          <div className="text-right space-y-2 px-2">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">
              {step === 'PATIENT_LOGIN' ? 'دخول المرضى' : 'دخول الأطباء'}
            </h2>
            <p className="text-slate-500 text-lg">أهلاً بك مجدداً، أدخل بياناتك للمتابعة</p>
          </div>

          <div className="bg-white p-8 rounded-[3rem] shadow-2xl shadow-slate-200 border border-slate-50">
            {error && (
              <div className="p-5 mb-6 bg-red-50 text-red-600 rounded-3xl text-sm font-black text-right border border-red-100 animate-bounce">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={step === 'PATIENT_LOGIN' ? handlePatientLogin : handleDoctorLogin} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-right text-sm font-black text-slate-700 mr-2">
                  {step === 'PATIENT_LOGIN' ? 'رقم الهاتف المسجل' : 'البريد الإلكتروني المهني'}
                </label>
                <input 
                  type={step === 'PATIENT_LOGIN' ? "tel" : "email"} 
                  placeholder={step === 'PATIENT_LOGIN' ? "مثال: 05XXXXXXXX" : "example@clinic.com"} 
                  required 
                  className="w-full p-5 bg-slate-50 border border-slate-100 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-blue-100 focus:bg-white transition-all text-right font-bold text-lg" 
                  value={step === 'PATIENT_LOGIN' ? phone : email} 
                  onChange={e => step === 'PATIENT_LOGIN' ? setPhone(e.target.value) : setEmail(e.target.value)} 
                />
              </div>

              <div className="space-y-2">
                <label className="block text-right text-sm font-black text-slate-700 mr-2">كلمة المرور</label>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  required 
                  className="w-full p-5 bg-slate-50 border border-slate-100 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-blue-100 focus:bg-white transition-all text-right font-bold text-lg" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                />
              </div>
              
              <button 
                disabled={loading} 
                className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-[1.5rem] font-black text-xl shadow-2xl shadow-blue-100 transition-all transform active:scale-95 disabled:opacity-50"
              >
                {loading ? 'جاري التحقق...' : 'دخول آمن'}
              </button>
            </form>

            <div className="text-center pt-8 mt-8 border-t border-slate-50">
               {step === 'PATIENT_LOGIN' ? (
                 <button onClick={onRegisterClick} className="text-blue-600 font-black hover:text-blue-800 hover:underline transition-colors">ليس لديك حساب؟ انضم إلينا الآن كمريض</button>
               ) : (
                 <button onClick={onDoctorRegisterClick} className="text-indigo-600 font-black hover:text-indigo-800 hover:underline transition-colors">هل أنت طبيب؟ سجل عيادتك في النظام</button>
               )}
            </div>
          </div>
        </div>
      )}
      
      <ContactFooter />
      
      <div className="mt-10 mb-6 text-center">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">جميع الحقوق محفوظة © {new Date().getFullYear()} جسر الشفاء</p>
      </div>
    </div>
  );
};

export default Auth;
