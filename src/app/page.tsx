"use client"
/*import { text } from 'stream/consumers';*/
import SlotMachine from '../components/SlotMachine';

export default function Home() {
  return (
    <div>
      <h1 style={{ fontSize: '50px', textAlign: 'center', marginTop: '2rem' }}>spin and win!!!</h1>
      <SlotMachine />
    </div>
  );
}
