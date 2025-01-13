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
    '电子邮件地址',
  ]
  // 行政文书 类型
  const administrativeDocumentsType = [
    '法规',
    '引用法规条款编号',
    '主管机关',
    '收购方',
    '被收购方',
    '地理区域',
    '相关产品市场',
    '上市交易所名称',
    '主业范围',
    '纵向业务关系',
    '横向业务关系',
    '相邻业务关系',
    '设备组件',
    '市场份额区间',
    '市场份额排名',
    '反竞争能力构成要素',
    '反竞争动机构成要素',
    '反竞争行为方式',
    '附加限制性条件承诺方案名称',
    '申报收到时间',
    '申报立案时间',
    '进一步审查起始日',
    '延长审查起始日',
    '再次申报立案日',
    '最终承诺方案提交日',
    '交易协议日期',
    '收购方设立时间',
    '被收购方设立时间',
    '附条件批准时间',
    '申请撤回日',
    '限制性条件期限',
  ]

  const typeNames = [...shareholdersAgreementType, ...administrativeDocumentsType]

  const typesMps = {
    legal_admin: administrativeDocumentsType,
    shareholder_agreement: shareholdersAgreementType,
  }

  const typeList = computed(() => {
    return typesMps[itemName]?.map((el) => ({ text: el, value: el })) || []
  })

  const darkerLightColors = [
    'rgb(255, 255, 240)', // 浅黄色
    'rgb(245, 245, 245)', // 浅灰色
    'rgb(238, 255, 204)', // 浅黄绿色
    'rgb(255, 250, 204)', // 浅米黄色
    'rgb(255, 228, 181)', // 浅桃黄色
    'rgb(224, 255, 255)', // 浅天蓝色
    'rgb(173, 216, 230)', // 浅钢蓝色
    'rgb(255, 255, 224)', // 浅象牙色
    'rgb(255, 235, 189)', // 浅金色
    'rgb(204, 255, 173)', // 浅青绿色
    'rgb(255, 192, 203)', // 浅粉紫色
    'rgb(221, 238, 255)', // 浅冰蓝色
    'rgb(255, 165, 0)', // 浅橙色
    'rgb(255, 255, 204)', // 浅柠檬色
    'rgb(189, 252, 201)', // 浅海绿色
    'rgb(255, 204, 255)', // 浅紫红色
    'rgb(238, 223, 238)', // 浅紫色
    'rgb(255, 215, 0)', // 浅金色（偏橙）
    'rgb(224, 255, 224)', // 浅青绿色（偏白）
    'rgb(135, 206, 250)', // 浅亮蓝色
    'rgb(255, 160, 122)', // 浅番茄色
    'rgb(238, 232, 173)', // 浅米色（偏黄）
    'rgb(218, 255, 218)', // 浅薄荷色
    'rgb(255, 140, 0)', // 浅橙色（偏红）
    'rgb(255, 239, 213)', // 浅金色（偏黄）
    'rgb(250, 230, 210)', // 浅黄褐色
    'rgb(255, 204, 153)', // 浅桃红色
    'rgb(238, 255, 0)', // 浅黄色（偏绿）
    'rgb(255, 224, 179)', // 浅珊瑚色
    'rgb(238, 238, 255)', // 浅蓝色（偏白）
    'rgb(255, 245, 220)', // 浅米色（偏黄）
    'rgb(255, 218, 158)', // 浅棕色（偏红）
  ]

  const colors = {}
  typeNames.forEach((el, index) => {
    colors[el] = darkerLightColors[index]
  })

  return {
    typeNames,
    typeList,
    colors,
  }
}
