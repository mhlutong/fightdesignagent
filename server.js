const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const PORT = process.env.PORT || 3000;

// DeepSeek API配置
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || 'sk-96abdfaa73754608aaa4292f02824d8d';
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';
// DeepSeek模型：deepseek-chat 是标准模型，支持深度思考
const DEEPSEEK_MODEL = 'deepseek-chat';

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// 调用DeepSeek API
async function callDeepSeekAPI(prompt, enableDeepThinking = true) {
  try {
    const requestBody = {
      model: DEEPSEEK_MODEL,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    };

    // 如果启用深度思考，添加相应参数（DeepSeek可能通过模型名称或参数控制）
    // 注意：DeepSeek的深度思考功能可能需要特定的模型变体或参数
    if (enableDeepThinking) {
      // 某些DeepSeek模型变体可能支持深度思考参数
      // 如果API支持，可以添加 deep_thinking: true 或其他参数
    }

    const response = await axios.post(
      DEEPSEEK_API_URL,
      requestBody,
      {
        headers: {
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      success: true,
      content: response.data.choices[0].message.content,
      usage: response.data.usage
    };
  } catch (error) {
    console.error('DeepSeek API调用错误:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message
    };
  }
}

// API路由：生成新职业
app.post('/api/generate-profession', async (req, res) => {
  try {
    const { prompt, enableDeepThinking } = req.body;

    // 验证prompt是否存在
    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'Prompt不能为空'
      });
    }

    // 调用DeepSeek API
    const result = await callDeepSeekAPI(prompt, enableDeepThinking);

    if (result.success) {
      res.json({
        success: true,
        content: result.content,
        usage: result.usage
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('生成职业错误:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// API路由：生成新元素
app.post('/api/generate-element', async (req, res) => {
  try {
    const { prompt, enableDeepThinking } = req.body;

    // 验证prompt是否存在
    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'Prompt不能为空'
      });
    }

    // 调用DeepSeek API
    const result = await callDeepSeekAPI(prompt, enableDeepThinking);

    if (result.success) {
      res.json({
        success: true,
        content: result.content,
        usage: result.usage
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('生成元素错误:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// API路由：获取prompt模板
app.get('/api/prompts', async (req, res) => {
  try {
    const promptsPath = path.join(__dirname, 'prompts.json');
    const data = await fs.readFile(promptsPath, 'utf8');
    const prompts = JSON.parse(data);
    
    res.json({
      success: true,
      prompts
    });
  } catch (error) {
    console.error('读取prompt模板错误:', error);
    // 如果文件不存在或读取失败，返回默认值
    res.json({
      success: true,
      prompts: {
        profession: '我在做一个英雄学院背景的游戏，里面的学生可以学习课程获得技能，每个课程可以从Lv1提升至Lv5，课程分成两个大类，一类是职业，一类是元素，目前已经有的职业是%z，特征是%tp，目前已经有的元素是%y，特征是%te，现在给我生成一个新的职业和一个10字以内的特征，以json格式输出（只输出职业名和特征）{"职业": "XX"，"特征": "XX"}',
        element: '我在做一个英雄学院背景的游戏，里面的学生可以学习课程获得技能，每个课程可以从Lv1提升至Lv5，课程分成两个大类，一类是职业，一类是元素，目前已经有的职业是%z，特征是%tp，目前已经有的元素是%y，特征是%te，现在给我生成一个新的元素和一个10字以内的特征，以json格式输出（只输出元素名和特征）{"元素": "XX"，"特征": "XX"}',
        designSkills: '我在做一个英雄学院背景的游戏，里面的学生可以学习课程获得技能，每个课程可以从Lv1提升至Lv5，课程分成两个大类，一类是职业，目前已经有的职业是%z，%s，现在给新职业%z1设计常规技能，特征是%tp1，需要尽量符合职业特征，并且控制复杂度不要太复杂，不要意向描述类文字，以json格式输出，格式为{"lv1": "技能描述", "lv2": "技能描述", "lv3": "技能描述", "lv4": "技能描述", "lv5": "技能描述"}',
        designEnchantments: '我在做一个英雄学院背景的游戏，里面的学生可以学习课程获得技能，每个课程可以从Lv1提升至Lv5，课程分成两个大类，一类是元素，他们可以给技能附魔，目前已经有的元素是%y，%s，现在给新元素%y1设计给常规技能的附魔效果，特征是%te1，需要尽量符合元素特征，并且控制复杂度不要太复杂，不要意向描述类文字，以json格式输出，格式为{"lv1": "技能描述", "lv2": "技能描述", "lv3": "技能描述", "lv4": "技能描述", "lv5": "技能描述"}',
        adjustSkills: '我在做一个英雄学院背景的游戏，里面的学生可以学习课程获得技能，每个课程可以从Lv1提升至Lv5，课程分成两个大类，一类是职业，现在有一个职业%z1，特征是%tp1，当前的技能是%s1，现在我需要调整他，调整方向为%a，需要尽量符合职业特征，并且控制复杂度不要太复杂，不要意向描述类文字，以json格式输出，格式为{"lv1": "技能描述", "lv2": "技能描述", "lv3": "技能描述", "lv4": "技能描述", "lv5": "技能描述"}',
        adjustEnchantments: '我在做一个英雄学院背景的游戏，里面的学生可以学习课程获得技能，每个课程可以从Lv1提升至Lv5，课程分成两个大类，一类是元素，现在有一个元素%y1，特征是%te1，当前的技能是%s1，现在我需要调整他，需要调整的内容是%a，需要尽量符合元素特征，并且控制复杂度不要太复杂，不要意向描述类文字，以json格式输出，格式为{"lv1": "技能描述", "lv2": "技能描述", "lv3": "技能描述", "lv4": "技能描述", "lv5": "技能描述"}',
        adjustPassiveSkills: '我在做一个英雄学院背景的游戏，里面的学生可以学习课程获得技能，现在有一个课程%z1，特征是%t1，当前的被动技能是%s1，现在我需要调整他，需要调整的内容是%a，需要尽量符合特征，并且控制复杂度不要太复杂，不要意向描述类文字，以json格式输出，格式为{"skill1": "技能描述", "skill2": "技能描述"}',
        designPassiveSkills: '我在做一个英雄学院背景的游戏，里面的学生可以学习课程获得技能，现在有一个课程%z1，特征是%t1，通过这个课程可以学会的常规技能是%s1，现在需要你设计两个此职业的被动技能。其他课程已有的被动技能为%s，注意不要重复。需要尽量符合课程特征，并且控制复杂度不要太复杂，不要意向描述类文字，以json格式输出，格式为{"skill1": "技能描述", "skill2": "技能描述"}'
      }
    });
  }
});

// API路由：保存prompt模板
app.post('/api/prompts', async (req, res) => {
  try {
    const { prompts } = req.body;
    
    if (!prompts || !prompts.profession || !prompts.element || !prompts.designSkills || !prompts.designEnchantments || !prompts.adjustSkills || !prompts.adjustEnchantments || !prompts.adjustPassiveSkills || !prompts.designPassiveSkills) {
      return res.status(400).json({
        success: false,
        error: 'Prompt模板数据不完整'
      });
    }

    const promptsPath = path.join(__dirname, 'prompts.json');
    await fs.writeFile(promptsPath, JSON.stringify(prompts, null, 2), 'utf8');
    
    res.json({
      success: true,
      message: 'Prompt模板已保存'
    });
  } catch (error) {
    console.error('保存prompt模板错误:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// API路由：获取游戏数据（职业、元素、技能、附魔、深度思考状态）
app.get('/api/data', async (req, res) => {
  try {
    const dataPath = path.join(__dirname, 'data.json');
    const data = await fs.readFile(dataPath, 'utf8');
    const gameData = JSON.parse(data);
    
    res.json({
      success: true,
      data: gameData
    });
  } catch (error) {
    console.error('读取游戏数据错误:', error);
    // 如果文件不存在或读取失败，返回默认值
    res.json({
      success: true,
      data: {
        professions: [
          {
            name: '剑士',
            trait: '',
            skills: {
              lv1: '剑击：造成110%物理伤害',
              lv2: '强力剑击：造成130%物理伤害',
              lv3: '凌厉剑击：造成160%物理伤害',
              lv4: '大师剑击：造成200%物理伤害',
              lv5: '极意剑击：造成250%物理伤害'
            },
            passiveSkills: {
              skill1: '',
              skill2: ''
            }
          },
          {
            name: '法师',
            trait: '',
            skills: {
              lv1: '法球：造成110%法术伤害',
              lv2: '凝合法球：造成130%法术伤害',
              lv3: '高能法球：造成160%法术伤害',
              lv4: '大师法球：造成200%法术伤害',
              lv5: '终灭法球：造成250%法术伤害'
            },
            passiveSkills: {
              skill1: '',
              skill2: ''
            }
          }
        ],
        elements: [
          {
            name: '火元素',
            trait: '',
            enchantments: {
              lv1: '技能变为火元素伤害',
              lv2: '技能变为火元素伤害，灼烧目标2',
              lv3: '技能变为火元素伤害，灼烧目标4',
              lv4: '技能变为火元素伤害，提升50%伤害',
              lv5: '技能变为火元素伤害，提升50%伤害'
            },
            passiveSkills: {
              skill1: '',
              skill2: ''
            }
          },
          {
            name: '风元素',
            trait: '',
            enchantments: {
              lv1: '技能变为风元素伤害',
              lv2: '技能变为风元素伤害',
              lv3: '技能变为风元素伤害',
              lv4: '技能变为风元素伤害',
              lv5: '技能变为风元素伤害'
            },
            passiveSkills: {
              skill1: '',
              skill2: ''
            }
          }
        ],
        deepThinking: true
      }
    });
  }
});

// API路由：保存游戏数据（实时保存）
app.post('/api/data', async (req, res) => {
  try {
    const { data } = req.body;
    
    if (!data) {
      return res.status(400).json({
        success: false,
        error: '数据不能为空'
      });
    }

    // 验证数据结构
    if (!Array.isArray(data.professions) || !Array.isArray(data.elements)) {
      return res.status(400).json({
        success: false,
        error: '数据格式不正确'
      });
    }

    const dataPath = path.join(__dirname, 'data.json');
    await fs.writeFile(dataPath, JSON.stringify(data, null, 2), 'utf8');
    
    res.json({
      success: true,
      message: '游戏数据已保存'
    });
  } catch (error) {
    console.error('保存游戏数据错误:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// API路由：生成职业常规技能
app.post('/api/generate-skills', async (req, res) => {
  try {
    const { prompt, enableDeepThinking } = req.body;

    // 验证prompt是否存在
    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'Prompt不能为空'
      });
    }

    // 调用DeepSeek API
    const result = await callDeepSeekAPI(prompt, enableDeepThinking);

    if (result.success) {
      res.json({
        success: true,
        content: result.content,
        usage: result.usage
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('生成技能错误:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// API路由：生成元素附魔效果
app.post('/api/generate-enchantments', async (req, res) => {
  try {
    const { prompt, enableDeepThinking } = req.body;

    // 验证prompt是否存在
    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'Prompt不能为空'
      });
    }

    // 调用DeepSeek API
    const result = await callDeepSeekAPI(prompt, enableDeepThinking);

    if (result.success) {
      res.json({
        success: true,
        content: result.content,
        usage: result.usage
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('生成附魔错误:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// API路由：调整职业技能
app.post('/api/adjust-skills', async (req, res) => {
  try {
    const { prompt, enableDeepThinking } = req.body;

    // 验证prompt是否存在
    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'Prompt不能为空'
      });
    }

    // 调用DeepSeek API
    const result = await callDeepSeekAPI(prompt, enableDeepThinking);

    if (result.success) {
      res.json({
        success: true,
        content: result.content,
        usage: result.usage
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('调整技能错误:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// API路由：调整元素附魔
app.post('/api/adjust-enchantments', async (req, res) => {
  try {
    const { prompt, enableDeepThinking } = req.body;

    // 验证prompt是否存在
    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'Prompt不能为空'
      });
    }

    // 调用DeepSeek API
    const result = await callDeepSeekAPI(prompt, enableDeepThinking);

    if (result.success) {
      res.json({
        success: true,
        content: result.content,
        usage: result.usage
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('调整附魔错误:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// API路由：调整被动技能
app.post('/api/adjust-passive-skills', async (req, res) => {
  try {
    const { prompt, enableDeepThinking } = req.body;

    // 验证prompt是否存在
    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'Prompt不能为空'
      });
    }

    // 调用DeepSeek API
    const result = await callDeepSeekAPI(prompt, enableDeepThinking);

    if (result.success) {
      res.json({
        success: true,
        content: result.content,
        usage: result.usage
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('调整被动技能错误:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// API路由：设计被动技能
app.post('/api/design-passive-skills', async (req, res) => {
  try {
    const { prompt, enableDeepThinking } = req.body;

    // 验证prompt是否存在
    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'Prompt不能为空'
      });
    }

    // 调用DeepSeek API
    const result = await callDeepSeekAPI(prompt, enableDeepThinking);

    if (result.success) {
      res.json({
        success: true,
        content: result.content,
        usage: result.usage
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('设计被动技能错误:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});
