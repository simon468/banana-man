// Original eight-bar funk loop. Audio-clock scheduling keeps the groove steady
// through rendering stalls and combat hit-stop; no downloaded audio required.
export function createFunkTrack(context) {
  const bus=context.createGain(),compressor=context.createDynamicsCompressor();
  bus.gain.value=0;compressor.threshold.value=-18;compressor.ratio.value=4;
  bus.connect(compressor).connect(context.destination);
  const buffer=context.createBuffer(1,context.sampleRate*.3,context.sampleRate);
  const data=buffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;
  const stepDuration=60/112/4;
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
    if([0,6,10].includes(s)||(bar%2===1&&s===14))kick(t);
    if(s===4||s===12)drum(t,true);
    if(s%2===0||[3,11,15].includes(s))drum(t,false,s===14,s%2?.42:.8);
    if(bar===7&&[13,15].includes(s))drum(t,true,false,.4);
    const bass={0:[0,.19],3:[12,.09],6:[7,.16],8:[0,.11],10:[10,.12],14:[7,.11],15:[12,.07]};
    if(bass[s]){const [offset,length]=bass[s];note(root+offset,t,length,.38,'sawtooth');note(root+offset-12,t,length,.12);}
    if([2,7,11,14].includes(s))for(const interval of [12,15,19,22])note(root+interval,t,.10,.065,'sawtooth',true);
    // A short pentatonic hook answers the rhythm section every other bar.
    if(bar%2===1){const hook={1:24,5:27,9:31,11:34,14:31};if(hook[s]!==undefined)note(root+hook[s],t,.16,.10,'triangle');}
  }
  const timer=setInterval(()=>{
    if(!active||context.state!=='running')return;
    if(next<context.currentTime-.1)next=context.currentTime+.025;
    while(next<context.currentTime+.1){schedule(step,next+(step%2?stepDuration*.12:0));next+=stepDuration;step=(step+1)%128;}
  },25);
  return {
    setPlaying(value){if(value===active)return;active=value;const t=context.currentTime;bus.gain.cancelScheduledValues(t);bus.gain.setTargetAtTime(active?.24:0,t,.035);if(active)next=t+.025;},
    dispose(){clearInterval(timer);bus.disconnect();compressor.disconnect();}
  };
}
