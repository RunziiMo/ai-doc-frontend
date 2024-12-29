import { computed } from 'vue'

export default function useTypes(itemName: string) {
  // 股东协议 类型
  const shareholdersAgreementType = [
    '人名',
    '地址',
    '时间',
    '组织',
    '金额',
    '数字',
    '品牌',
    '身份证号',
    '电子邮件地址'
  ]
  // 行政文书 类型
  const administrativeDocumentsType = [
    '参与集中的经营者名称',
    '企业性质',
    ' 统一社会信用代码',
    '申报人',
    '合并方',
    '收购方',
    '被收购方',
    '股权出让方',
    '被收购方的原有股东',
    '合营方',
    '全球范围主要业务',
    '中国境内主要业务',
    '最终控制人'
  ]

  const typeNames = [...shareholdersAgreementType, ...administrativeDocumentsType]

  const typesMps = {
    legal_admin: administrativeDocumentsType,
    shareholder_agreement: shareholdersAgreementType
  }

  const typeList = computed(() => {
    return typesMps[itemName]?.map((el) => ({ text: el, value: el })) || []
  })

  const darkerLightColors = [
    'rgb(238, 232, 170)', // 浅棕色
    'rgb(216, 255, 191)', // 浅黄绿色
    'rgb(192, 250, 255)', // 浅青色带灰
    'rgb(153, 255, 255)', // 浅天蓝色带灰
    'rgb(136, 255, 165)', // 浅绿蓝色
    'rgb(255, 235, 189)', // 浅橙色带黄
    'rgb(255, 204, 188)', // 浅粉红色带橙
    'rgb(255, 192, 203)', // 浅紫红色
    'rgb(255, 182, 107)', // 浅橙色带棕
    'rgb(245, 245, 215)', // 浅米黄色带灰
    'rgb(204, 255, 229)', // 浅青绿色带灰
    'rgb(173, 216, 230)', // 浅蓝紫色
    'rgb(153, 204, 255)', // 浅蓝色带灰
    'rgb(136, 189, 255)', // 浅天蓝色带深灰
    'rgb(238, 238, 204)', // 浅黄色带灰
    'rgb(230, 230, 173)', // 浅黄绿色带灰
    'rgb(217, 217, 181)', // 浅棕色带灰
    'rgb(204, 255, 204)', // 浅青绿色带白
    'rgb(189, 255, 189)', // 浅绿色带白
    'rgb(173, 255, 173)', // 浅绿色更深
    'rgb(224, 255, 224)', // 浅绿色带白更亮
    'rgb(211, 238, 211)' // 浅黄绿色带白更亮
  ]

  const colors = {}
  typeNames.forEach((el, index) => {
    colors[el] = darkerLightColors[index]
  })

  return {
    typeNames,
    typeList,
    colors
  }
}
