"use client";
import {useEffect,useState} from 'react';
import {usePathname} from 'next/navigation';
export default function ArticleContents({label}){const path=usePathname(),[links,setLinks]=useState([]);useEffect(()=>{const heads=[...document.querySelectorAll('article.article h2')];setLinks(heads.map((h,i)=>{if(!h.id)h.id='section-'+i;return {id:h.id,title:h.textContent}}));},[path]);return links.length>2?<nav className="article-contents" aria-label={label}><details><summary>{label}</summary><ul>{links.map(x=><li key={x.id}><a href={'#'+x.id}>{x.title}</a></li>)}</ul></details></nav>:null}
