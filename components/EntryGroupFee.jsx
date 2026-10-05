import copy from '../data/entry-routing-ui.json';
import {fact} from '../lib/facts';
export default function EntryGroupFee({locale}){
 const f=fact('group-c32-fee-waiver');if(!f)return null;
 return <section className="entry-guidance entry-group-fee"><h3>C-3-2</h3><p>{(copy[locale]||copy.en).groupFee}</p><p className="entry-reviewed"><time dateTime={f.verified}>{f.verified}</time> · <a href={f.source} target="_blank" rel="noopener noreferrer">C-3-2 ↗</a></p></section>;
}
