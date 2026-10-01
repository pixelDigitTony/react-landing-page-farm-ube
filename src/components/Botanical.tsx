import { useId } from 'react'

export function Leaf() {
  const id = useId()
  return <svg className="leaf-art" viewBox="0 0 900 640" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id={id} x1=".2" y1="0" x2=".8" y2="1"><stop stopColor="var(--ube-leaf-light)" /><stop offset="1" stopColor="var(--ube-leaf-dark)" /></linearGradient></defs><path d="M860 572C683 514 858 175 580 74C388 4 226 106 152 243C36 226 7 324 68 418C210 635 561 618 860 572Z" fill={`url(#${id})`} stroke="var(--ube-lime)" strokeWidth="2" /><path d="M154 243C354 301 572 436 860 572M346 309L343 147M446 364L542 170M552 431L661 277M662 493L772 373M348 310L224 473M450 365L402 546M554 431L557 573" fill="none" stroke="var(--ube-vein)" strokeOpacity=".35" strokeWidth="1.5" /></svg>
}
export function RootBoard() {
  return <svg className="root-board" viewBox="0 0 1120 620" preserveAspectRatio="none" aria-hidden="true"><path d="M47 346C-17 195 63 78 239 35C403-3 463 55 650 19C851-21 1053 63 1095 223C1151 434 1006 593 803 602C610 611 549 560 368 605C190 649 94 505 47 346Z" fill="var(--ube-root-skin)" /><path d="M65 340C10 205 94 95 255 59C418 25 489 83 658 45C839 10 1029 93 1068 239C1115 414 982 564 798 574C599 584 542 534 376 576C211 615 104 485 65 340Z" fill="var(--ube-purple)" /><path d="M105 305Q230 200 380 245M650 80Q880 80 960 205M765 530Q530 465 430 526" fill="none" stroke="var(--ube-violet)" strokeOpacity=".2" strokeWidth="2" /></svg>
}

