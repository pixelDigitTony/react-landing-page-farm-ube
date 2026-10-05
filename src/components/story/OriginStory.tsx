import { useEffect, useRef, useState } from 'react'
import type { MouseEvent } from 'react'
import { Link } from 'react-router-dom'
import { ASSETS, DEMO_DATA, SITE } from '../../constants/site'
import type { Layout } from '../../constants/site'
import { batchPath, farmPath } from '../../data/farms'
import type { OriginTarget } from '../../data/farms'
import { Lookup } from '../Lookup'
import { Arrow, FarmCard, Photo } from '../UI'
import { OriginQr } from '../FarmQr'
import { imageSources } from '../../lib/images'
import { SoilCurtain } from './SoilCurtain'
import type { SoilSceneApi } from './SoilCurtain'
import { HarvestArtwork } from './HarvestArtwork'
import { useOriginStoryMotion } from '../../hooks/useOriginStoryMotion'
import './story.css'

type Actions = { navigationKey: string; layout: Layout; motionOff: boolean; onScan: () => void; onFound: (target: OriginTarget, anchor?: string) => void; onFarm: (id: string, anchor: string) => void }
export default function OriginStory({navigationKey,layout,motionOff,onScan,onFound,onFarm}: Actions) {
  const root = useRef<HTMLElement>(null), frames = useRef<SoilSceneApi | null>(null)
  const [ready,setReady] = useState(false)
  // Tablet and phone use the authored portrait camera, never a cropped desktop shot.
  const phone = layout !== 'desktop'
  const batch = DEMO_DATA.batches.find(item => item.id === SITE.story.featuredBatchId)!
  const farm = DEMO_DATA.farms.find(item => item.id === batch.farmId)!
  const date = new Intl.DateTimeFormat(SITE.format.locale,{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(batch.harvestDate))
  const target: OriginTarget = {kind:'batch',id:batch.id}
  const source = phone ? ASSETS.story.phone : ASSETS.story.desktop
  useEffect(() => {
    let alive = true
    const images = [...root.current!.querySelectorAll<HTMLImageElement>('.story-hero [data-sc-layer]')]
    Promise.all(images.map(item=>item.decode())).then(()=>{if(alive)setReady(true)}).catch(()=>{/* Complete hero poster remains underneath. */})
    return()=>{alive=false}
  },[])
  useOriginStoryMotion(root,frames,motionOff,phone)
  const openBatch = (event: MouseEvent<HTMLAnchorElement>,anchor: string) => {
    if(event.button || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey)return
    event.preventDefault();onFound(target,anchor)
  }
  const openFarm=(event:MouseEvent<HTMLAnchorElement>,anchor:string)=>{
    if(event.button || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey)return
    event.preventDefault();onFarm(farm.id,anchor)
  }
  return <main id="main-content" ref={root} data-navigation-key={navigationKey} className={`origin-world origin-story ${ready?'layers-ready':''} ${motionOff?'motion-off':''}`} tabIndex={-1} aria-label={SITE.accessibility.main}>
    <section className="origin-hero story-hero" aria-labelledby="hero-title">
      <div className="story-hero-art" aria-hidden="true">
        <img className="hero-poster story-landscape" src={ASSETS.master.src} srcSet={imageSources(ASSETS.master)} sizes="100vw" width={ASSETS.master.width} height={ASSETS.master.height} alt="" fetchPriority="high" />
        <img data-sc-layer className="story-far story-landscape" src={ASSETS.canopy.src} srcSet={imageSources(ASSETS.canopy)} sizes="100vw" width={ASSETS.canopy.width} height={ASSETS.canopy.height} alt="" />
        <img data-sc-layer className="story-botany" src={ASSETS.plant.src} srcSet={imageSources(ASSETS.plant)} sizes="1100px" width={ASSETS.plant.width} height={ASSETS.plant.height} alt="" />
        <img data-sc-layer className="story-near" src={ASSETS.foreground.small} width={ASSETS.foreground.width} height={ASSETS.foreground.height} alt="" />
      </div><div className="hero-scrim" aria-hidden="true" />
      <div className="hero-copy"><p className="eyebrow">{SITE.hero.location}</p><h1 id="hero-title">{SITE.hero.title}</h1><p className="hero-body">{SITE.hero.body}</p><div className="hero-actions"><Link className="button" to="/#farms">{SITE.hero.explore}<Arrow/></Link><Link className="button secondary" to="/#farm-origin">{SITE.hero.story}</Link></div></div>
      <div id="origin" className="leaf-lookup"><div className="lookup-scrim" aria-hidden="true"/><Lookup heading onFound={onFound} onScan={onScan}/></div>
    </section>
    <section id="farm-origin" className="farm-origin story-chapter" aria-labelledby="farm-origin-title">
      <div className="farm-origin-intro"><h2 id="farm-origin-title">{SITE.story.farmTitle}</h2><p>{SITE.story.farmBody}</p></div>
      <figure className="origin-photo-frame"><Photo asset={farm.image} alt={farm.imageAlt}/><figcaption><span>{SITE.profile.sample}</span><strong>{farm.name}</strong><span>{farm.location}</span><Link className="text-link" to={farmPath(farm.id)} onClick={event=>openFarm(event,'farm-origin')}>{SITE.story.farmAction}<Arrow/></Link></figcaption></figure>
    </section>
    <div className="harvest-bridge">
      <section id="roots" className="underground-chapter" aria-labelledby="underground-title"><div id="underground" className="underground-stage">
        <SoilCurtain api={frames} phone={phone} motionOff={motionOff}/><div className="underground-reading"><h2 id="underground-title">{SITE.story.undergroundTitle}</h2><p>{SITE.story.undergroundBody}</p></div><p className="scene-disclosure">{SITE.story.illustration}</p>
      </div></section>
      <section id="harvest" className="harvest-chapter story-chapter" aria-labelledby="harvest-title">
        <div className="harvest-intro"><h2 id="harvest-title">{SITE.story.harvestTitle}</h2><p>{SITE.story.harvestBody}</p></div>
        <article className="harvest-record"><div className="harvest-image"><HarvestArtwork phone={phone}/></div>
          <div className="harvest-record-copy"><p className="section-note">{SITE.story.recordLabel}</p><h3>{batch.id}</h3><dl><div><dt>{SITE.batch.farm}</dt><dd><Link to={farmPath(farm.id)} onClick={event=>openFarm(event,'harvest')}>{farm.name}</Link></dd></div><div><dt>{SITE.batch.produce}</dt><dd>{batch.produce}</dd></div><div><dt>{SITE.batch.harvest}</dt><dd><time dateTime={batch.harvestDate}>{date}</time></dd></div></dl><Link className="button" to={batchPath(batch.id)} onClick={event=>openBatch(event,'harvest')}>{SITE.story.openBatch}<Arrow/></Link></div>
        </article>
      </section><img className="yam-transfer" src={source.subject} width={source.subjectWidth} height={source.subjectHeight} alt="" aria-hidden="true"/>
    </div>
    <section id="batch-journey" className="batch-journey story-chapter" aria-labelledby="batch-journey-title">
      <div className="journey-intro"><h2 id="batch-journey-title">{SITE.story.handoffsTitle}</h2><p>{SITE.story.handoffsBody}</p><p className="record-disclosure">{SITE.story.recordNote}</p></div>
      <div className="journey-grid"><div className="handoff-history"><svg className="handoff-line" viewBox="0 0 48 1000" preserveAspectRatio="none" aria-hidden="true"><path className="handoff-track" d="M24 0 C-4 90 52 150 24 250 S-4 410 24 500 S52 670 24 750 S-4 920 24 1000"/><path className="handoff-progress" d="M24 0 C-4 90 52 150 24 250 S-4 410 24 500 S52 670 24 750 S-4 920 24 1000"/></svg><ol>
        {[{title:SITE.story.growingStep,label:SITE.batch.farm,value:farm.name,body:batch.growingSummary},{title:SITE.story.harvestStep,label:SITE.batch.harvest,value:date,body:batch.produce},{title:SITE.story.processorStep,label:SITE.batch.processor,value:batch.processor},{title:SITE.story.recipientStep,label:SITE.batch.recipient,value:batch.recipient}].map((step,index)=><li className="handoff-step" key={step.title}><span className="handoff-dot" aria-hidden="true"/><div><h3>{step.title}</h3><p className="handoff-label">{step.label}</p><p className="handoff-value">{index===1?<time dateTime={batch.harvestDate}>{step.value}</time>:step.value}</p>{step.body&&<p>{step.body}</p>}</div></li>)}
      </ol></div><div className="public-origin"><h3>{SITE.story.publicSummary}</h3><p>{SITE.story.publicBody}</p><OriginQr target={target}/><Link className="button" to={batchPath(batch.id)} onClick={event=>openBatch(event,'batch-journey')}>{SITE.story.openBatch}<Arrow/></Link></div></div>
    </section>
    <section id="cooperative" className="cooperative-chapter story-chapter" aria-labelledby="people-title"><div className="cooperative-intro"><h2 id="people-title">{SITE.roots.title}</h2><div><p>{SITE.story.closeBody}</p><Link className="text-link" to="/cooperative">{SITE.roots.action}<Arrow/></Link></div></div><div id="farms" className="featured-farms"><div className="featured-content"><h2 id="farms-title">{SITE.farms.title}</h2><p className="section-note">{SITE.farms.sample}</p><div className="featured-grid">{DEMO_DATA.farms.filter(item=>SITE.farms.featured.some(id=>id===item.id)).map(item=><FarmCard key={item.id} farm={item} onOpen={onFarm}/>)}</div><Link className="all-farms text-link" to="/farms">{SITE.farms.all}<Arrow/></Link></div></div></section>
  </main>
}
