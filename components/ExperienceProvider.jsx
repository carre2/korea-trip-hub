"use client";
import { createContext, useContext } from 'react';
const Experience = createContext({});
export const useExperience = () => useContext(Experience);
export default function ExperienceProvider({ labels, children }) {
  return <Experience.Provider value={labels}>{children}</Experience.Provider>;
}
