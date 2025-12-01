// カテゴリ別評価基準
export const CATEGORY_CONFIGS = {
  '自己紹介': {
    weightings: { specificity: 30, logic: 20, starStructure: 25, companyFit: 10, growth: 15 },
    keyPoints: ['具体的な経験や強み', 'エピソードの構造', '人柄の表現'],
  },
  '志望動機': {
    weightings: { specificity: 15, logic: 25, starStructure: 15, companyFit: 35, growth: 10 },
    keyPoints: ['企業研究の深さ', '論理的な理由', '熱意の表現'],
  },
  'ESの深掘り': {
    weightings: { specificity: 25, logic: 20, starStructure: 30, companyFit: 10, growth: 15 },
    keyPoints: ['STAR形式での説明', '具体的な行動', '成果と学び'],
  },
  '企業固有の質問': {
    weightings: { specificity: 10, logic: 25, starStructure: 10, companyFit: 40, growth: 15 },
    keyPoints: ['業界・企業知識', '独自の視点', '将来性の理解'],
  },
  '将来性': {
    weightings: { specificity: 15, logic: 25, starStructure: 15, companyFit: 20, growth: 25 },
    keyPoints: ['キャリアビジョン', '成長意欲', '企業での活かし方'],
  }
};