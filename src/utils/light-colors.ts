/**
 * 生成随机浅色的颜色值
 * @param {number} count - 需要生成的颜色数量
 * @returns {string[]} - 浅色颜色值的数组
 */
// eslint-disable-next-line no-unused-vars
export const generateLightColors = (count) => {
  const colors = []

  for (let i = 0; i < count; i++) {
    // 生成 128 到 255 之间的随机整数，以确保颜色是浅色的
    const r = Math.floor(Math.random() * 128) + 128
    const g = Math.floor(Math.random() * 128) + 128
    const b = Math.floor(Math.random() * 128) + 128

    // 将 RGB 值转换为十六进制颜色字符串
    const color = `rgb(${r}, ${g}, ${b})`
    colors.push(color)
  }

  return colors
}
