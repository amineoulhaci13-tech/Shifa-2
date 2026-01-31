import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';

interface RegisterDoctorProps { 
  onBack: () => void; 
  onSuccess: (data: any) => void; 
}

const RegisterDoctor: React.FC<RegisterDoctorProps> = ({ onBack, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '', specialty: '', phone: '', state: '' });
  const [agreed, setAgreed] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      alert("يرجى الموافقة على الشروط والأحكام للمتابعة");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('doctors')
        .insert([{ 
          full_name: formData.fullName, 
          email: formData.email, 
          password: formData.password, 
          specialty: formData.specialty, 
          phone_number: formData.phone, 
          state: formData.state 
        }])
        .select()
        .single();
        
      if (error) {
        alert("خطأ أثناء التسجيل: " + error.message);
      } else {
        onSuccess({ 
          ...data, 
          role: 'DOCTOR', 
          name: data.full_name, 
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.full_name)}&background=312e81&color=fff` 
        });
      }
    } catch (err) {
      alert("حدث خطأ غير متوقع.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-indigo-50 font-arabic">
      <div className="bg-white p-10 rounded-[3rem] shadow-2xl w-full max-w-md text-right">
        <h2 className="text-4xl font-black mb-2 text-slate-800 tracking-tight">انضم كطبيب</h2>
        <p className="text-slate-500 font-bold mb-10">سجل عيادتك وابدأ باستقبال المرضى</p>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <input type="text" placeholder="الاسم الكامل للطبيب" required className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-100 font-black text-right" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
          <input type="email" placeholder="البريد الإلكتروني المهني" required className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-100 font-black text-right" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          <input type="text" placeholder="التخصص (مثلاً: قلبية، أطفال...)" required className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-100 font-black text-right" value={formData.specialty} onChange={e => setFormData({...formData, specialty: e.target.value})} />
          <input type="tel" placeholder="رقم الهاتف للتواصل" required className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-100 font-black text-right" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
          <input type="password" placeholder="كلمة المرور" required className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-100 font-black text-right" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
          
          <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <input 
              type="checkbox" 
              id="terms-doc" 
              checked={agreed} 
              onChange={(e) => setAgreed(e.target.checked)}
              className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
            />
            <label htmlFor="terms-doc" className="text-xs font-black text-slate-600 cursor-pointer">
              أوافق على <button type="button" onClick={() => setShowTerms(true)} className="text-indigo-600 hover:underline font-black">اتفاقية الشروط والأحكام</button>
            </label>
          </div>

          <button 
            type="submit" 
            disabled={loading || !agreed} 
            className={`w-full py-5 rounded-2xl font-black text-lg shadow-xl transition-all ${
              agreed ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100' : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
            }`}
          >
            {loading ? 'جاري إنشاء حسابك...' : 'تسجيل الطبيب والمتابعة'}
          </button>
          
          <button type="button" onClick={onBack} className="w-full text-slate-400 font-black text-sm mt-4 hover:text-slate-600 transition-colors">إلغاء والعودة للدخول</button>
        </form>
      </div>

      {showTerms && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-indigo-600 text-white rounded-t-[2rem]">
              <h3 className="text-xl font-black">اتفاقية الشروط والأحكام</h3>
              <button onClick={() => setShowTerms(false)} className="text-2xl font-bold hover:rotate-90 transition-transform">×</button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 text-right space-y-6 text-slate-700 custom-scrollbar" dir="rtl">
              <h4 className="font-black text-xl text-indigo-600 border-b pb-3">اتفاقية الشروط والأحكام لاستخدام منصة جسر الشفاء</h4>
              
              <div className="space-y-6 text-sm leading-relaxed">
                <section>
                  <p className="font-black text-slate-900 mb-1">1. مقدمة وتعريفات</p>
                  <p>تعد هذه الاتفاقية عقداً قانونياً بين "المستخدم" (مريض أو طبيب) وبين "منصة جسر الشفاء". إن استخدامك للمنصة أو التسجيل فيها يعني موافقتك الصريحة على كافة البنود الواردة أدناه.</p>
                </section>

                <section>
                  <p className="font-black text-slate-900 mb-1">2. طبيعة الخدمة (إخلاء مسؤولية طبية)</p>
                  <ul className="list-disc pr-5 space-y-1">
                    <li>المنصة هي وسيط تقني لتنظيم وحجز المواعيد فقط، ولا تقدم أي استشارات طبية أو تشخيصات.</li>
                    <li>لا تتحمل المنصة أي مسؤولية عن جودة الخدمة الطبية المقدمة من الطبيب، أو أي خطأ طبي ناتج عن الاستشارة، حيث تقع المسؤولية المهنية والقانونية بالكامل على عاتق الطبيب.</li>
                    <li>تنبيه الطوارئ: المنصة ليست مخصصة للحالات الطبية الطارئة. في حال وجود حالة حرجة، يجب التوجه فوراً لأقرب مستشفى أو الاتصال بالإسعاف.</li>
                  </ul>
                </section>

                <section>
                  <p className="font-black text-slate-900 mb-1">3. التزامات المستخدم (المريض)</p>
                  <ul className="list-disc pr-5 space-y-1">
                    <li>يتعهد المريض بتقديم بيانات صحيحة (الاسم، رقم الهاتف، التاريخ الطبي إن لزم).</li>
                    <li>المريض مسؤول عن الحضور في الموعد المحدد، وفي حال التأخر قد يعتبر الموعد ملغياً دون استرداد الرسوم (حسب سياسة الطبيب).</li>
                  </ul>
                </section>

                <section>
                  <p className="font-black text-slate-900 mb-1">4. التزامات الطبيب</p>
                  <ul className="list-disc pr-5 space-y-1">
                    <li>يقر الطبيب بأن كافة المعلومات والتراخيص المهنية التي يزود المنصة بها صحيحة وسارية المفعول.</li>
                    <li>يلتزم الطبيب بتحديث جدول مواعيده لتجنب تضارب المواعيد مع المرضى.</li>
                  </ul>
                </section>

                <section>
                  <p className="font-black text-slate-900 mb-1">5. سياسة الدفع وإلغاء المواعيد</p>
                  <ul className="list-disc pr-5 space-y-1">
                    <li>يتم تحصيل رسوم الحجز (إن وجدت) عبر الوسائل المتاحة في المنصة.</li>
                    <li>الإلغاء من طرف المريض: يمكن إلغاء الموعد قبل 24 ساعة لاسترداد المبلغ كاملاً، وبعد ذلك قد يتم خصم رسوم إدارية.</li>
                    <li>الإلغاء من طرف الطبيب: في حال اعتذار الطبيب، يتم تخيير المريض بين إعادة جدولة الموعد أو استرداد المبلغ بالكامل.</li>
                  </ul>
                </section>

                <section>
                  <p className="font-black text-slate-900 mb-1">6. حماية البيانات والخصوصية</p>
                  <ul className="list-disc pr-5 space-y-1">
                    <li>تلتزم المنصة بأقصى معايير التشفير لحماية بيانات المرضى وسجلاتهم.</li>
                    <li>لا يتم مشاركة بيانات المريض إلا مع الطبيب المعني الذي تم الحجز لديه لغرض المعاينة فقط.</li>
                  </ul>
                </section>

                <section>
                  <p className="font-black text-slate-900 mb-1">7. إنهاء الخدمة</p>
                  <p>للمنصة الحق في حظر أي حساب يقوم بإساءة استخدام النظام، أو تقديم معلومات كاذبة، أو تكرار التغيب عن المواعيد دون عذر مبرر.</p>
                </section>

                <section>
                  <p className="font-black text-slate-900 mb-1">8. القانون الواجب التطبيق</p>
                  <p>تخضع هذه الشروط وتفسر وفقاً للقوانين والأنظمة المعمول بها في [الجزائر]، وتختص المحاكم في [الرمشي] بالنظر في أي نزاع ينشأ عنها.</p>
                </section>
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-[2rem]">
              <button onClick={() => { setAgreed(true); setShowTerms(false); }} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg hover:bg-indigo-700 transition-colors">قرأت وأوافق على كافة الشروط</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterDoctor;
