"use client";
export default function ConsentPreferences({label}){
 return <button type="button" className="consent-preferences" onClick={()=>window.dispatchEvent(new Event('kth-consent-open'))}>{label}</button>;
}
