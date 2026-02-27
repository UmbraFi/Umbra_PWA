export interface Product {
  id: string
  name: string
  brand: string
  price: number
  image: string
  category: string
  description: string
  seller: string
  size?: string
  condition: 'New' | 'Like New' | 'Used'
}

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Phantom Hoodie',
    brand: 'UMBRA',
    price: 2.5,
    image: 'https://placehold.co/400x500/111/fff?text=Phantom+Hoodie',
    category: 'Tops',
    description: 'Oversized heavyweight hoodie with reflective ghost print. 450 GSM cotton.',
    seller: '7xKz...9fRm',
    size: 'L',
    condition: 'New',
  },
  {
    id: '2',
    name: 'Void Runner V2',
    brand: 'SHADOW STEP',
    price: 3.8,
    image: 'https://placehold.co/400x500/222/fff?text=Void+Runner',
    category: 'Shoes',
    description: 'Triple-black mesh runner with carbon fiber sole plate.',
    seller: '4pQw...2nXk',
    size: '42',
    condition: 'New',
  },
  {
    id: '3',
    name: 'Stealth Cargo Pants',
    brand: 'UMBRA',
    price: 1.9,
    image: 'https://placehold.co/400x500/333/fff?text=Stealth+Cargo',
    category: 'Bottoms',
    description: 'Water-resistant ripstop cargo with hidden zip pockets.',
    seller: '7xKz...9fRm',
    size: 'M',
    condition: 'Like New',
  },
  {
    id: '4',
    name: 'Cipher Tee',
    brand: 'DARK FOREST',
    price: 0.8,
    image: 'https://placehold.co/400x500/444/fff?text=Cipher+Tee',
    category: 'Tops',
    description: 'Washed black tee with encrypted text graphic.',
    seller: '9mBv...3hTp',
    size: 'XL',
    condition: 'New',
  },
  {
    id: '5',
    name: 'Obsidian Chain',
    brand: 'VOID JEWELRY',
    price: 5.2,
    image: 'https://placehold.co/400x500/555/fff?text=Obsidian+Chain',
    category: 'Accessories',
    description: 'Matte black titanium chain with onyx pendant.',
    seller: '2kLp...8wQz',
    condition: 'New',
  },
  {
    id: '6',
    name: 'Eclipse Jacket',
    brand: 'UMBRA',
    price: 4.1,
    image: 'https://placehold.co/400x500/1a1a1a/fff?text=Eclipse+Jacket',
    category: 'Tops',
    description: 'Heavyweight waxed cotton jacket with concealed hood.',
    seller: '4pQw...2nXk',
    size: 'M',
    condition: 'Like New',
  },
  {
    id: '7',
    name: 'Spectre Beanie',
    brand: 'DARK FOREST',
    price: 0.5,
    image: 'https://placehold.co/400x500/2a2a2a/fff?text=Spectre+Beanie',
    category: 'Accessories',
    description: 'Merino wool beanie with embroidered sigil.',
    seller: '9mBv...3hTp',
    condition: 'New',
  },
  {
    id: '8',
    name: 'Wraith Denim',
    brand: 'SHADOW STEP',
    price: 2.2,
    image: 'https://placehold.co/400x500/3a3a3a/fff?text=Wraith+Denim',
    category: 'Bottoms',
    description: 'Raw selvedge denim, triple-washed black.',
    seller: '7xKz...9fRm',
    size: '32',
    condition: 'Used',
  },
]