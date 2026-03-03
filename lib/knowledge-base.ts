import kbData from '@/knowledge_base/fund_industry_kb.json';

export interface KnowledgeBase {
  version: string;
  description: string;
  categories: {
    fund_types: {
      description: string;
      items: Array<{
        term: string;
        definition: string;
        features: string[];
        prd_points: string[];
      }>;
    };
    core_systems: {
      description: string;
      items: Array<{
        term: string;
        full_name?: string;
        definition: string;
        types?: string[];
        core_functions?: string[];
        prd_points: string[];
      }>;
    };
    business_terms: {
      description: string;
      items: Array<{
        term: string;
        full_name?: string;
        definition: string;
        formula?: string;
        prd_points: string[];
      }>;
    };
    process_flows: {
      description: string;
      items: Array<{
        name: string;
        steps: string[];
      }>;
    };
    precision_rules: {
      description: string;
      items: Array<{
        type: string;
        precision: number;
        rounding?: string;
        note?: string;
      }>;
    };
    compliance: {
      description: string;
      items: string[];
    };
  };
}

export function loadKnowledgeBase(): KnowledgeBase {
  return kbData as KnowledgeBase;
}

export function getKnowledgeBaseText(): string {
  const kb = loadKnowledgeBase();

  let text = `=== 公募基金行业知识库 v${kb.version} ===\n\n`;

  // 基金类型
  text += `【基金类型】\n`;
  kb.categories.fund_types.items.forEach(item => {
    text += `- ${item.term}: ${item.definition}\n`;
    text += `  特点: ${item.features.join(', ')}\n`;
    text += `  PRD注意点: ${item.prd_points.join(', ')}\n\n`;
  });

  // 核心系统
  text += `【核心系统】\n`;
  kb.categories.core_systems.items.forEach(item => {
    text += `- ${item.term}${item.full_name ? `(${item.full_name})` : ''}: ${item.definition}\n`;
    text += `  核心功能: ${item.core_functions?.join(', ') || 'N/A'}\n`;
    text += `  PRD注意点: ${item.prd_points.join(', ')}\n\n`;
  });

  // 业务术语
  text += `【业务术语】\n`;
  kb.categories.business_terms.items.forEach(item => {
    text += `- ${item.term}: ${item.definition}\n`;
    if (item.formula) text += `  公式: ${item.formula}\n`;
    text += `  PRD注意点: ${item.prd_points.join(', ')}\n\n`;
  });

  // 精度规则
  text += `【精度规则】\n`;
  kb.categories.precision_rules.items.forEach(item => {
    text += `- ${item.type}: 保留${item.precision}位小数${item.note ? `(${item.note})` : ''}\n`;
  });

  // 合规要求
  text += `\n【合规要求】\n`;
  kb.categories.compliance.items.forEach(item => {
    text += `- ${item}\n`;
  });

  return text;
}
