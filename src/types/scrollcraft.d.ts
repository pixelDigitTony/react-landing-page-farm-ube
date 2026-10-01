interface ScrollCraftInstance { layout(): void; read(): void }
interface Window { ScrollCraft?: { mount(root: HTMLElement): ScrollCraftInstance; instances: ScrollCraftInstance[] } }
