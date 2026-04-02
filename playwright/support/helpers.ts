export function generateOrderCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    
    const part1 = Array.from({ length: 4 }, () => 
      chars[Math.floor(Math.random() * chars.length)]
    ).join('')
  
    const part2 = Array.from({ length: 2 }, () => 
      chars[Math.floor(Math.random() * chars.length)]
    ).join('')
  
    return `VLO-${part1}${part2}`
  }