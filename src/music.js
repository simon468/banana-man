// Related arrangements share the original harmony and pentatonic vocabulary.
export const musicScenes={
 combat:{bpm:112,kicks:[0,6,10],bass:[0,3,6,8,10,14,15],chords:[2,7,11,14],lead:[1,5,9,11,14],melody:[24,27,31,34,31],level:1},
 title:{bpm:104,kicks:[0,10],bass:[0,6,8,14],chords:[2,10],lead:[0,3,6,10,14],melody:[24,31,34,31,27],level:.85},
 pause:{bpm:78,kicks:[0],bass:[0,8],chords:[0,8],lead:[2,10],melody:[31,27],level:.45},
 permanent:{bpm:100,kicks:[0,7,10],bass:[0,3,8,11,14],chords:[2,6,10,14],lead:[1,4,7,11,14],melody:[24,28,31,36,34],level:.75},
 diamond:{bpm:108,kicks:[0,6,12],bass:[0,6,10,14],chords:[2,11],lead:[0,2,6,8,10,14],melody:[36,43,39,46,43,39],level:.7},
 upgrade:{bpm:118,kicks:[0,6,10],bass:[0,3,6,10,14],chords:[2,7,14],lead:[0,3,6,9,12,14],melody:[24,27,31,34,36,31],level:.8},
 boss:{bpm:124,kicks:[0,3,8,10,14],bass:[0,2,6,8,10,14],chords:[2,6,10,14],lead:[1,7,11,15],melody:[24,22,19,27],level:.9},
 controls:{bpm:94,kicks:[0,10],bass:[0,6,8],chords:[2,10],lead:[2,6,10,14],melody:[24,27,31,27],level:.6},
 settings:{bpm:88,kicks:[0,8],bass:[0,8,14],chords:[4,12],lead:[3,11,14],melody:[31,29,27],level:.55},
 tutorial:{bpm:102,kicks:[0,10],bass:[0,6,8,14],chords:[2,7,14],lead:[1,5,9,13],melody:[24,27,29,31],level:.7},
 build:{bpm:96,kicks:[0,6,10],bass:[0,3,8,14],chords:[2,11],lead:[3,7,11,15],melody:[31,34,29,27],level:.65},
 over:{bpm:76,kicks:[0],bass:[0,8],chords:[0,10],lead:[1,5,9,13],melody:[36,34,31,24],level:.55}
};
// Original eight-bar funk loop. Audio-clock scheduling keeps the groove steady
// through rendering stalls and combat hit-stop; no downloaded audio required.
export function createFunkTrack(context) {
  const bus=context.createGain(),compressor=context.createDynamicsCompressor();
  bus.gain.value=0;compressor.threshold.value=-18;compressor.ratio.value=4;
  bus.connect(compressor).connect(context.destination);
  const buffer=context.createBuffer(1,context.sampleRate*.3,context.sampleRate);
  const data=buffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;
  let scene='combat',arrangement=musicScenes.combat,stepDuration=60/arrangement.bpm/4;
  let active=false,next=0,step=0;
  const hz=midi=>440*2**((midi-69)/12);
  function note(midi,t,length,level,type='triangle',wah=false) {
    const source=context.createOscillator(),gain=context.createGain(),filter=context.createBiquadFilter();
    source.type=type;source.frequency.value=hz(midi);
    filter.type='lowpass';filter.Q.value=wah?4:.7;
    filter.frequency.setValueAtTime(wah?2600:1600,t);
    filter.frequency.exponentialRampToValueAtTime(wah?320:650,t+length);
    gain.gain.setValueAtTime(.001,t);gain.gain.linearRampToValueAtTime(level,t+.006);
    gain.gain.exponentialRampToValueAtTime(.001,t+length);
    source.connect(filter).connect(gain).connect(bus);
    source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect();};
    source.start(t);source.stop(t+length+.01);
  }
  function kick(t) {
    const source=context.createOscillator(),gain=context.createGain();
    source.frequency.setValueAtTime(145,t);source.frequency.exponentialRampToValueAtTime(42,t+.13);
    gain.gain.setValueAtTime(.65,t);gain.gain.exponentialRampToValueAtTime(.001,t+.22);
    source.connect(gain).connect(bus);source.onended=()=>{source.disconnect();gain.disconnect();};
    source.start(t);source.stop(t+.23);
  }
  function drum(t,snare=false,open=false,level=1) {
    const source=context.createBufferSource(),gain=context.createGain(),filter=context.createBiquadFilter();
    source.buffer=buffer;filter.type='highpass';filter.frequency.value=snare?1100:6500;
    const length=snare?.13:open?.15:.035;
    gain.gain.setValueAtTime((snare?.32:.12)*level,t);gain.gain.exponentialRampToValueAtTime(.001,t+length);
    source.connect(filter).connect(gain).connect(bus);
    source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect();};source.start(t);source.stop(t+length+.01);
    if(snare)note(50,t,.07,.13,'triangle');
  }
  function schedule(index,t) {
    const bar=Math.floor(index/16)%8,s=index%16,root=[40,40,45,45,40,40,47,45][bar];
    // Sixteenth-note swing; syncopated bass and offbeat wah chord stabs.
    if(arrangement.kicks.includes(s))kick(t);
    if(s===12||(s===4&&arrangement.level>.6))drum(t,true,false,arrangement.level);
    if(s%(arrangement.level<.6?4:2)===0)drum(t,false,s===14,arrangement.level*.8);
    if(arrangement.level>.7&&bar===7&&[13,15].includes(s))drum(t,true,false,.4);
    const bass={0:[0,.19],3:[12,.09],6:[7,.16],8:[0,.11],10:[10,.12],14:[7,.11],15:[12,.07]};
    if(arrangement.bass.includes(s)){const [offset,length]=bass[s]||[s%4===0?0:7,.12];note(root+offset,t,length,.38,'sawtooth');note(root+offset-12,t,length,.12);}
    if(arrangement.chords.includes(s))for(const interval of [12,15,19,22])note(root+interval,t,arrangement.level<.6?.5:.10,.065*arrangement.level,arrangement.level<.6?'triangle':'sawtooth',arrangement.level>=.6);
    // A short pentatonic hook answers the rhythm section every other bar.
    if(scene!=='combat'||bar%2===1){const phrase=arrangement.lead.indexOf(s);if(phrase>=0)note(root+arrangement.melody[phrase],t,scene==='diamond'?.3:.18,.10*arrangement.level,scene==='diamond'?'sine':'triangle');}
  }
  const timer=setInterval(()=>{
    if(!active||context.state!=='running')return;
    if(next<context.currentTime-.1)next=context.currentTime+.025;
    while(next<context.currentTime+.1){schedule(step,next+(step%2?stepDuration*.12:0));next+=stepDuration;step=(step+1)%128;}
  },25);
  return {
    setScene(value){const chosen=musicScenes[value]?value:'combat';if(chosen===scene)return;scene=chosen;arrangement=musicScenes[scene];stepDuration=60/arrangement.bpm/4;step=0;next=context.currentTime+.12;},
    setPlaying(value){if(value===active)return;active=value;const t=context.currentTime;bus.gain.cancelScheduledValues(t);bus.gain.setTargetAtTime(active?.24:0,t,.035);if(active)next=t+.025;},
    dispose(){clearInterval(timer);bus.disconnect();compressor.disconnect();}
  };
}
