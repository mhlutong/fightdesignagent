// 获取DOM元素
const professionsList = document.getElementById('professionsList');
const elementsList = document.getElementById('elementsList');
const generateProfessionBtn = document.getElementById('generateProfessionBtn');
const generateElementBtn = document.getElementById('generateElementBtn');
const responseArea = document.getElementById('responseArea');
const deepThinkingToggle = document.getElementById('deepThinkingToggle');
const professionPromptInput = document.getElementById('professionPrompt');
const elementPromptInput = document.getElementById('elementPrompt');
const designSkillsPromptInput = document.getElementById('designSkillsPrompt');
const designEnchantmentsPromptInput = document.getElementById('designEnchantmentsPrompt');
const adjustSkillsPromptInput = document.getElementById('adjustSkillsPrompt');
const adjustEnchantmentsPromptInput = document.getElementById('adjustEnchantmentsPrompt');
const adjustPassiveSkillsPromptInput = document.getElementById('adjustPassiveSkillsPrompt');
const designPassiveSkillsPromptInput = document.getElementById('designPassiveSkillsPrompt');

// 保存防抖定时器
let saveTimer = null;

// 从列表获取所有职业名称
function getProfessionNames() {
    const items = professionsList.querySelectorAll('.profession-item');
    return Array.from(items)
        .map(item => {
            const input = item.querySelector('.profession-name-input');
            return input ? input.value.trim() : '';
        })
        .filter(name => name.length > 0);
}

// 从列表获取所有元素名称
function getElementNames() {
    const items = elementsList.querySelectorAll('.element-item');
    return Array.from(items)
        .map(item => {
            const input = item.querySelector('.element-name-input');
            return input ? input.value.trim() : '';
        })
        .filter(name => name.length > 0);
}

// 获取所有职业及其特征
function getProfessionsWithTraits() {
    const result = [];
    professionsList.querySelectorAll('.profession-item').forEach(item => {
        const nameInput = item.querySelector('.profession-name-input');
        const traitInput = item.querySelector('.profession-trait-input');
        if (nameInput) {
            const name = nameInput.value.trim();
            const trait = traitInput ? traitInput.value.trim() : '';
            if (name) {
                result.push({ name, trait });
            }
        }
    });
    return result;
}

// 获取所有元素及其特征
function getElementsWithTraits() {
    const result = [];
    elementsList.querySelectorAll('.element-item').forEach(item => {
        const nameInput = item.querySelector('.element-name-input');
        const traitInput = item.querySelector('.element-trait-input');
        if (nameInput) {
            const name = nameInput.value.trim();
            const trait = traitInput ? traitInput.value.trim() : '';
            if (name) {
                result.push({ name, trait });
            }
        }
    });
    return result;
}

// 获取所有游戏数据
function getAllGameData() {
    const professions = [];
    const elements = [];

    // 获取职业数据
    professionsList.querySelectorAll('.profession-item').forEach(item => {
        const nameInput = item.querySelector('.profession-name-input');
        if (!nameInput) return;
        
        const name = nameInput.value.trim();
        if (!name) return;

        const traitInput = item.querySelector('.profession-trait-input');
        const trait = traitInput ? traitInput.value.trim() : '';

        const skills = {};
        ['lv1', 'lv2', 'lv3', 'lv4', 'lv5'].forEach(level => {
            const skillInput = item.querySelector(`.skill-input[data-level="${level}"]`);
            if (skillInput) {
                skills[level] = skillInput.value.trim();
            }
        });

        const passiveSkills = {};
        ['skill1', 'skill2'].forEach(skill => {
            const passiveSkillInput = item.querySelector(`.passive-skill-input[data-skill="${skill}"]`);
            if (passiveSkillInput) {
                passiveSkills[skill] = passiveSkillInput.value.trim();
            }
        });

        professions.push({ name, trait, skills, passiveSkills });
    });

    // 获取元素数据
    elementsList.querySelectorAll('.element-item').forEach(item => {
        const nameInput = item.querySelector('.element-name-input');
        if (!nameInput) return;
        
        const name = nameInput.value.trim();
        if (!name) return;

        const traitInput = item.querySelector('.element-trait-input');
        const trait = traitInput ? traitInput.value.trim() : '';

        const enchantments = {};
        ['lv1', 'lv2', 'lv3', 'lv4', 'lv5'].forEach(level => {
            const enchantInput = item.querySelector(`.enchantment-input[data-level="${level}"]`);
            if (enchantInput) {
                enchantments[level] = enchantInput.value.trim();
            }
        });

        const passiveSkills = {};
        ['skill1', 'skill2'].forEach(skill => {
            const passiveSkillInput = item.querySelector(`.passive-skill-input[data-skill="${skill}"]`);
            if (passiveSkillInput) {
                passiveSkills[skill] = passiveSkillInput.value.trim();
            }
        });

        elements.push({ name, trait, enchantments, passiveSkills });
    });

    return {
        professions,
        elements,
        deepThinking: deepThinkingToggle.checked
    };
}

// 实时保存数据（防抖）
function autoSave() {
    // 清除之前的定时器
    if (saveTimer) {
        clearTimeout(saveTimer);
    }

    // 设置新的定时器，500ms后保存
    saveTimer = setTimeout(async () => {
        const gameData = getAllGameData();
        
        try {
            const response = await fetch('/api/data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ data: gameData })
            });

            const result = await response.json();
            if (result.success) {
                console.log('数据已自动保存');
            }
        } catch (error) {
            console.error('自动保存失败:', error);
        }
    }, 500);
}

// 创建职业项
function createProfessionItem(profession) {
    const item = document.createElement('div');
    item.className = 'profession-item';
    item.dataset.professionName = profession.name;

    const skills = profession.skills || {
        lv1: '', lv2: '', lv3: '', lv4: '', lv5: ''
    };

    const passiveSkills = profession.passiveSkills || {
        skill1: '', skill2: ''
    };

    const trait = profession.trait || '';

    item.innerHTML = `
        <div class="profession-header" onclick="toggleSkillsByHeader(this)">
            <div class="header-left">
                <span class="expand-icon">▼</span>
                <input type="text" class="profession-name-input" value="${profession.name}" placeholder="职业名称" onclick="event.stopPropagation()">
                <input type="text" class="profession-trait-input" value="${trait}" placeholder="特征（10字以内）" maxlength="10" onclick="event.stopPropagation()">
            </div>
            <div class="header-right" onclick="event.stopPropagation()">
                <button class="delete-btn" onclick="deleteProfession(this)">🗑️</button>
            </div>
        </div>
        <div class="skills-container">
            <div class="skills-buttons-header">
                <button class="design-skill-btn" onclick="designSkills(this)">🎨 设计常规技能</button>
                <div class="adjust-section">
                    <input type="text" class="adjust-direction-input">
                    <button class="adjust-skill-btn" onclick="adjustSkills(this)">🔧 调整常规技能</button>
                </div>
            </div>
            <div class="skill-row">
                <span class="skill-label">Lv1:</span>
                <input type="text" class="skill-input" data-level="lv1" value="${skills.lv1 || ''}" placeholder="Lv1常规技能">
            </div>
            <div class="skill-row">
                <span class="skill-label">Lv2:</span>
                <input type="text" class="skill-input" data-level="lv2" value="${skills.lv2 || ''}" placeholder="Lv2常规技能">
            </div>
            <div class="skill-row">
                <span class="skill-label">Lv3:</span>
                <input type="text" class="skill-input" data-level="lv3" value="${skills.lv3 || ''}" placeholder="Lv3常规技能">
            </div>
            <div class="skill-row">
                <span class="skill-label">Lv4:</span>
                <input type="text" class="skill-input" data-level="lv4" value="${skills.lv4 || ''}" placeholder="Lv4常规技能">
            </div>
            <div class="skill-row">
                <span class="skill-label">Lv5:</span>
                <input type="text" class="skill-input" data-level="lv5" value="${skills.lv5 || ''}" placeholder="Lv5常规技能">
            </div>
            <div class="passive-skills-section">
                <div class="passive-skills-header">
                    <button class="design-passive-skill-btn" onclick="designPassiveSkills(this)">🎨 设计被动技能</button>
                    <div class="adjust-passive-section">
                        <input type="text" class="adjust-passive-direction-input">
                        <button class="adjust-passive-skill-btn" onclick="adjustPassiveSkills(this)">🔧 调整被动技能</button>
                    </div>
                </div>
                <div class="passive-skill-row">
                    <span class="passive-skill-label">被动技能1:</span>
                    <input type="text" class="passive-skill-input" data-skill="skill1" value="${passiveSkills.skill1 || ''}" placeholder="被动技能1">
                </div>
                <div class="passive-skill-row">
                    <span class="passive-skill-label">被动技能2:</span>
                    <input type="text" class="passive-skill-input" data-skill="skill2" value="${passiveSkills.skill2 || ''}" placeholder="被动技能2">
                </div>
            </div>
        </div>
    `;

    // 绑定输入事件，实现实时保存
    const nameInput = item.querySelector('.profession-name-input');
    const traitInput = item.querySelector('.profession-trait-input');
    const skillInputs = item.querySelectorAll('.skill-input');
    const passiveSkillInputs = item.querySelectorAll('.passive-skill-input');
    
    nameInput.addEventListener('input', autoSave);
    if (traitInput) {
        traitInput.addEventListener('input', autoSave);
    }
    skillInputs.forEach(input => {
        input.addEventListener('input', autoSave);
    });
    passiveSkillInputs.forEach(input => {
        input.addEventListener('input', autoSave);
    });

    return item;
}

// 创建元素项
function createElementItem(element) {
    const item = document.createElement('div');
    item.className = 'element-item';
    item.dataset.elementName = element.name;

    const enchantments = element.enchantments || {
        lv1: '', lv2: '', lv3: '', lv4: '', lv5: ''
    };

    const passiveSkills = element.passiveSkills || {
        skill1: '', skill2: ''
    };

    const trait = element.trait || '';

    item.innerHTML = `
        <div class="element-header" onclick="toggleEnchantmentsByHeader(this)">
            <div class="header-left">
                <span class="expand-icon">▼</span>
                <input type="text" class="element-name-input" value="${element.name}" placeholder="元素名称" onclick="event.stopPropagation()">
                <input type="text" class="element-trait-input" value="${trait}" placeholder="特征（10字以内）" maxlength="10" onclick="event.stopPropagation()">
            </div>
            <div class="header-right" onclick="event.stopPropagation()">
                <button class="delete-btn" onclick="deleteElement(this)">🗑️</button>
            </div>
        </div>
        <div class="enchantments-container">
            <div class="enchantments-buttons-header">
                <button class="design-enchantment-btn" onclick="designEnchantments(this)">🎨 设计附魔</button>
                <div class="adjust-section">
                    <input type="text" class="adjust-direction-input">
                    <button class="adjust-enchantment-btn" onclick="adjustEnchantments(this)">🔧 调整附魔</button>
                </div>
            </div>
            <div class="enchantment-row">
                <span class="enchantment-label">Lv1:</span>
                <input type="text" class="enchantment-input" data-level="lv1" value="${enchantments.lv1 || ''}" placeholder="Lv1技能附魔效果">
            </div>
            <div class="enchantment-row">
                <span class="enchantment-label">Lv2:</span>
                <input type="text" class="enchantment-input" data-level="lv2" value="${enchantments.lv2 || ''}" placeholder="Lv2技能附魔效果">
            </div>
            <div class="enchantment-row">
                <span class="enchantment-label">Lv3:</span>
                <input type="text" class="enchantment-input" data-level="lv3" value="${enchantments.lv3 || ''}" placeholder="Lv3技能附魔效果">
            </div>
            <div class="enchantment-row">
                <span class="enchantment-label">Lv4:</span>
                <input type="text" class="enchantment-input" data-level="lv4" value="${enchantments.lv4 || ''}" placeholder="Lv4技能附魔效果">
            </div>
            <div class="enchantment-row">
                <span class="enchantment-label">Lv5:</span>
                <input type="text" class="enchantment-input" data-level="lv5" value="${enchantments.lv5 || ''}" placeholder="Lv5技能附魔效果">
            </div>
            <div class="passive-skills-section">
                <div class="passive-skills-header">
                    <button class="design-passive-skill-btn" onclick="designPassiveSkills(this)">🎨 设计被动技能</button>
                    <div class="adjust-passive-section">
                        <input type="text" class="adjust-passive-direction-input">
                        <button class="adjust-passive-skill-btn" onclick="adjustPassiveSkills(this)">🔧 调整被动技能</button>
                    </div>
                </div>
                <div class="passive-skill-row">
                    <span class="passive-skill-label">被动技能1:</span>
                    <input type="text" class="passive-skill-input" data-skill="skill1" value="${passiveSkills.skill1 || ''}" placeholder="被动技能1">
                </div>
                <div class="passive-skill-row">
                    <span class="passive-skill-label">被动技能2:</span>
                    <input type="text" class="passive-skill-input" data-skill="skill2" value="${passiveSkills.skill2 || ''}" placeholder="被动技能2">
                </div>
            </div>
        </div>
    `;

    // 绑定输入事件，实现实时保存
    const nameInput = item.querySelector('.element-name-input');
    const traitInput = item.querySelector('.element-trait-input');
    const enchantInputs = item.querySelectorAll('.enchantment-input');
    const passiveSkillInputs = item.querySelectorAll('.passive-skill-input');
    
    nameInput.addEventListener('input', autoSave);
    if (traitInput) {
        traitInput.addEventListener('input', autoSave);
    }
    enchantInputs.forEach(input => {
        input.addEventListener('input', autoSave);
    });
    passiveSkillInputs.forEach(input => {
        input.addEventListener('input', autoSave);
    });

    return item;
}

// 切换技能显示（通过header点击）
function toggleSkillsByHeader(header) {
    const item = header.closest('.profession-item');
    const container = item.querySelector('.skills-container');
    const expandIcon = header.querySelector('.expand-icon');
    const isShowing = container.classList.contains('show');
    
    if (isShowing) {
        container.classList.remove('show');
        expandIcon.textContent = '▼';
        expandIcon.style.transform = 'rotate(0deg)';
    } else {
        container.classList.add('show');
        expandIcon.textContent = '▲';
        expandIcon.style.transform = 'rotate(0deg)';
    }
}

// 切换附魔显示（通过header点击）
function toggleEnchantmentsByHeader(header) {
    const item = header.closest('.element-item');
    const container = item.querySelector('.enchantments-container');
    const expandIcon = header.querySelector('.expand-icon');
    const isShowing = container.classList.contains('show');
    
    if (isShowing) {
        container.classList.remove('show');
        expandIcon.textContent = '▼';
        expandIcon.style.transform = 'rotate(0deg)';
    } else {
        container.classList.add('show');
        expandIcon.textContent = '▲';
        expandIcon.style.transform = 'rotate(0deg)';
    }
}

// 切换技能显示（保留旧函数以兼容）
function toggleSkills(button) {
    const item = button.closest('.profession-item');
    const container = item.querySelector('.skills-container');
    const isShowing = container.classList.contains('show');
    
    if (isShowing) {
        container.classList.remove('show');
        button.textContent = '展开技能';
    } else {
        container.classList.add('show');
        button.textContent = '收起技能';
    }
}

// 切换附魔显示（保留旧函数以兼容）
function toggleEnchantments(button) {
    const item = button.closest('.element-item');
    const container = item.querySelector('.enchantments-container');
    const isShowing = container.classList.contains('show');
    
    if (isShowing) {
        container.classList.remove('show');
        button.textContent = '展开附魔';
    } else {
        container.classList.add('show');
        button.textContent = '收起附魔';
    }
}

// 删除职业
function deleteProfession(button) {
    const items = professionsList.querySelectorAll('.profession-item');
    if (items.length <= 1) {
        alert('至少需要保留一个职业');
        return;
    }
    
    button.closest('.profession-item').remove();
    autoSave();
}

// 删除元素
function deleteElement(button) {
    const items = elementsList.querySelectorAll('.element-item');
    if (items.length <= 1) {
        alert('至少需要保留一个元素');
        return;
    }
    
    button.closest('.element-item').remove();
    autoSave();
}

// 显示响应内容
function showResponse(content, isError = false, isSuccess = false) {
    responseArea.innerHTML = '';
    const div = document.createElement('div');
    div.className = `response-content ${isError ? 'error' : isSuccess ? 'success' : ''}`;
    div.textContent = content;
    responseArea.appendChild(div);
}

// 显示加载状态
function showLoading(message = '正在生成') {
    responseArea.innerHTML = `<div class="loading">${message}</div>`;
}

// 解析JSON响应，提取职业名和特征
function extractProfession(jsonString) {
    try {
        const json = JSON.parse(jsonString);
        if (json.职业) {
            return {
                name: json.职业,
                trait: json.特征 || ''
            };
        }
    } catch (e) {
        // 尝试提取职业名
        const nameMatch = jsonString.match(/"职业"\s*:\s*"([^"]+)"/);
        // 尝试提取特征
        const traitMatch = jsonString.match(/"特征"\s*:\s*"([^"]+)"/);
        
        if (nameMatch && nameMatch[1]) {
            return {
                name: nameMatch[1],
                trait: traitMatch && traitMatch[1] ? traitMatch[1] : ''
            };
        }
    }
    return null;
}

// 解析JSON响应，提取元素名和特征
function extractElement(jsonString) {
    try {
        const json = JSON.parse(jsonString);
        if (json.元素) {
            return {
                name: json.元素,
                trait: json.特征 || ''
            };
        }
    } catch (e) {
        // 尝试提取元素名
        const nameMatch = jsonString.match(/"元素"\s*:\s*"([^"]+)"/);
        // 尝试提取特征
        const traitMatch = jsonString.match(/"特征"\s*:\s*"([^"]+)"/);
        
        if (nameMatch && nameMatch[1]) {
            return {
                name: nameMatch[1],
                trait: traitMatch && traitMatch[1] ? traitMatch[1] : ''
            };
        }
    }
    return null;
}

// 从prompt模板中替换占位符
function buildPrompt(template, professions, elements, professionTraits = null, elementTraits = null) {
    let prompt = template;
    
    // 替换职业列表
    prompt = prompt.replace(/%z/g, professions.join('、'));
    
    // 替换元素列表
    prompt = prompt.replace(/%y/g, elements.join('、'));
    
    // 替换职业特征列表（%tp）
    if (professionTraits !== null) {
        prompt = prompt.replace(/%tp/g, professionTraits.join('、'));
    }
    
    // 替换元素特征列表（%te）
    if (elementTraits !== null) {
        prompt = prompt.replace(/%te/g, elementTraits.join('、'));
    }
    
    return prompt;
}

// 生成新职业
async function generateProfession() {
    const professions = getProfessionNames();
    const elements = getElementNames();
    const professionsWithTraits = getProfessionsWithTraits();
    const elementsWithTraits = getElementsWithTraits();
    const enableDeepThinking = deepThinkingToggle.checked;

    if (professions.length === 0) {
        showResponse('错误：至少需要一个职业', true);
        return;
    }
    if (elements.length === 0) {
        showResponse('错误：至少需要一个元素', true);
        return;
    }

    const promptTemplate = professionPromptInput.value.trim();
    if (!promptTemplate) {
        showResponse('错误：职业prompt模板不能为空', true);
        return;
    }

    // 构建特征列表（数组形式）
    const professionTraits = professionsWithTraits.map(p => p.trait || '无特征');
    const elementTraits = elementsWithTraits.map(e => e.trait || '无特征');

    const finalPrompt = buildPrompt(promptTemplate, professions, elements, professionTraits, elementTraits);

    generateProfessionBtn.disabled = true;
    showLoading('正在生成新职业');

    // 显示最终prompt用于调试
    const promptDiv = document.createElement('div');
    promptDiv.className = 'response-content';
    promptDiv.style.background = '#e3f2fd';
    promptDiv.style.padding = '15px';
    promptDiv.style.borderRadius = '5px';
    promptDiv.style.borderLeft = '4px solid #2196f3';
    promptDiv.style.marginBottom = '10px';
    promptDiv.innerHTML = `<strong>📝 最终Prompt：</strong><br><pre style="white-space: pre-wrap; word-wrap: break-word; margin-top: 10px;">${finalPrompt}</pre>`;
    responseArea.innerHTML = '';
    responseArea.appendChild(promptDiv);

    try {
        const response = await fetch('/api/generate-profession', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                prompt: finalPrompt,
                enableDeepThinking
            })
        });

        const data = await response.json();

        if (data.success) {
            const responseDiv = document.createElement('div');
            responseDiv.className = 'response-content success';
            responseDiv.textContent = data.content;
            responseArea.appendChild(responseDiv);

            const newProfessionData = extractProfession(data.content);

            if (newProfessionData && newProfessionData.name) {
                if (professions.includes(newProfessionData.name)) {
                    const infoDiv = document.createElement('div');
                    infoDiv.className = 'profession-added';
                    infoDiv.textContent = `⚠️ 职业"${newProfessionData.name}"已存在，未重复添加`;
                    responseArea.appendChild(infoDiv);
                } else {
                    // 添加新职业，带特征和默认技能
                    const newProfessionItem = createProfessionItem({
                        name: newProfessionData.name,
                        trait: newProfessionData.trait || '',
                        skills: {
                            lv1: '', lv2: '', lv3: '', lv4: '', lv5: ''
                        },
                        passiveSkills: {
                            skill1: '', skill2: ''
                        }
                    });
                    professionsList.appendChild(newProfessionItem);

                    const infoDiv = document.createElement('div');
                    infoDiv.className = 'profession-added';
                    infoDiv.textContent = `✅ 成功添加新职业："${newProfessionData.name}"${newProfessionData.trait ? `，特征："${newProfessionData.trait}"` : ''}`;
                    responseArea.appendChild(infoDiv);
                    
                    autoSave();
                }
            } else {
                const infoDiv = document.createElement('div');
                infoDiv.className = 'profession-added';
                infoDiv.textContent = '⚠️ 无法从响应中提取职业名，请手动检查并添加';
                responseArea.appendChild(infoDiv);
            }
        } else {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'response-content error';
            errorDiv.textContent = `错误：${data.error}`;
            responseArea.appendChild(errorDiv);
        }
    } catch (error) {
        console.error('生成职业错误:', error);
        const errorDiv = document.createElement('div');
        errorDiv.className = 'response-content error';
        errorDiv.textContent = `网络错误：${error.message}`;
        responseArea.appendChild(errorDiv);
    } finally {
        generateProfessionBtn.disabled = false;
    }
}

// 生成新元素
async function generateElement() {
    const professions = getProfessionNames();
    const elements = getElementNames();
    const professionsWithTraits = getProfessionsWithTraits();
    const elementsWithTraits = getElementsWithTraits();
    const enableDeepThinking = deepThinkingToggle.checked;

    if (professions.length === 0) {
        showResponse('错误：至少需要一个职业', true);
        return;
    }
    if (elements.length === 0) {
        showResponse('错误：至少需要一个元素', true);
        return;
    }

    const promptTemplate = elementPromptInput.value.trim();
    if (!promptTemplate) {
        showResponse('错误：元素prompt模板不能为空', true);
        return;
    }

    // 构建特征列表（数组形式）
    const professionTraits = professionsWithTraits.map(p => p.trait || '无特征');
    const elementTraits = elementsWithTraits.map(e => e.trait || '无特征');

    const finalPrompt = buildPrompt(promptTemplate, professions, elements, professionTraits, elementTraits);

    generateElementBtn.disabled = true;
    showLoading('正在生成新元素');

    // 显示最终prompt用于调试
    const promptDiv = document.createElement('div');
    promptDiv.className = 'response-content';
    promptDiv.style.background = '#e3f2fd';
    promptDiv.style.padding = '15px';
    promptDiv.style.borderRadius = '5px';
    promptDiv.style.borderLeft = '4px solid #2196f3';
    promptDiv.style.marginBottom = '10px';
    promptDiv.innerHTML = `<strong>📝 最终Prompt：</strong><br><pre style="white-space: pre-wrap; word-wrap: break-word; margin-top: 10px;">${finalPrompt}</pre>`;
    responseArea.innerHTML = '';
    responseArea.appendChild(promptDiv);

    try {
        const response = await fetch('/api/generate-element', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                prompt: finalPrompt,
                enableDeepThinking
            })
        });

        const data = await response.json();

        if (data.success) {
            const responseDiv = document.createElement('div');
            responseDiv.className = 'response-content success';
            responseDiv.textContent = data.content;
            responseArea.appendChild(responseDiv);

            const newElementData = extractElement(data.content);

            if (newElementData && newElementData.name) {
                if (elements.includes(newElementData.name)) {
                    const infoDiv = document.createElement('div');
                    infoDiv.className = 'profession-added';
                    infoDiv.textContent = `⚠️ 元素"${newElementData.name}"已存在，未重复添加`;
                    responseArea.appendChild(infoDiv);
                } else {
                    // 添加新元素，带特征和默认附魔效果
                    const newElementItem = createElementItem({
                        name: newElementData.name,
                        trait: newElementData.trait || '',
                        enchantments: {
                            lv1: '', lv2: '', lv3: '', lv4: '', lv5: ''
                        },
                        passiveSkills: {
                            skill1: '', skill2: ''
                        }
                    });
                    elementsList.appendChild(newElementItem);

                    const infoDiv = document.createElement('div');
                    infoDiv.className = 'profession-added';
                    infoDiv.textContent = `✅ 成功添加新元素："${newElementData.name}"${newElementData.trait ? `，特征："${newElementData.trait}"` : ''}`;
                    responseArea.appendChild(infoDiv);
                    
                    autoSave();
                }
            } else {
                const infoDiv = document.createElement('div');
                infoDiv.className = 'profession-added';
                infoDiv.textContent = '⚠️ 无法从响应中提取元素名，请手动检查并添加';
                responseArea.appendChild(infoDiv);
            }
        } else {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'response-content error';
            errorDiv.textContent = `错误：${data.error}`;
            responseArea.appendChild(errorDiv);
        }
    } catch (error) {
        console.error('生成元素错误:', error);
        const errorDiv = document.createElement('div');
        errorDiv.className = 'response-content error';
        errorDiv.textContent = `网络错误：${error.message}`;
        responseArea.appendChild(errorDiv);
    } finally {
        generateElementBtn.disabled = false;
    }
}

// 从服务器加载游戏数据
async function loadGameData() {
    try {
        const response = await fetch('/api/data');
        const result = await response.json();
        
        if (result.success && result.data) {
            const data = result.data;

            // 加载深度思考状态
            if (data.deepThinking !== undefined) {
                deepThinkingToggle.checked = data.deepThinking;
            }

            // 加载职业数据
            professionsList.innerHTML = '';
            if (data.professions && Array.isArray(data.professions)) {
                data.professions.forEach(profession => {
                    const item = createProfessionItem(profession);
                    professionsList.appendChild(item);
                });
            }

            // 加载元素数据
            elementsList.innerHTML = '';
            if (data.elements && Array.isArray(data.elements)) {
                data.elements.forEach(element => {
                    const item = createElementItem(element);
                    elementsList.appendChild(item);
                });
            }

            console.log('游戏数据已加载');
        }
    } catch (error) {
        console.error('加载游戏数据错误:', error);
    }
}

// 从服务器加载prompt模板
async function loadPrompts() {
    try {
        const response = await fetch('/api/prompts');
        const data = await response.json();
        
        if (data.success && data.prompts) {
            if (data.prompts.profession) {
                professionPromptInput.value = data.prompts.profession;
            }
            if (data.prompts.element) {
                elementPromptInput.value = data.prompts.element;
            }
            if (data.prompts.designSkills) {
                designSkillsPromptInput.value = data.prompts.designSkills;
            }
            if (data.prompts.designEnchantments) {
                designEnchantmentsPromptInput.value = data.prompts.designEnchantments;
            }
            if (data.prompts.adjustSkills) {
                adjustSkillsPromptInput.value = data.prompts.adjustSkills;
            }
            if (data.prompts.adjustEnchantments) {
                adjustEnchantmentsPromptInput.value = data.prompts.adjustEnchantments;
            }
            if (data.prompts.adjustPassiveSkills) {
                adjustPassiveSkillsPromptInput.value = data.prompts.adjustPassiveSkills;
            }
            if (data.prompts.designPassiveSkills) {
                designPassiveSkillsPromptInput.value = data.prompts.designPassiveSkills;
            }
            console.log('Prompt模板已加载');
        }
    } catch (error) {
        console.error('加载prompt模板错误:', error);
    }
}

// 保存prompt模板到文件
async function savePrompts() {
    const prompts = {
        profession: professionPromptInput.value.trim(),
        element: elementPromptInput.value.trim(),
        designSkills: designSkillsPromptInput.value.trim(),
        designEnchantments: designEnchantmentsPromptInput.value.trim(),
        adjustSkills: adjustSkillsPromptInput.value.trim(),
        adjustEnchantments: adjustEnchantmentsPromptInput.value.trim(),
        adjustPassiveSkills: adjustPassiveSkillsPromptInput.value.trim(),
        designPassiveSkills: designPassiveSkillsPromptInput.value.trim()
    };

    if (!prompts.profession || !prompts.element || !prompts.designSkills || !prompts.designEnchantments || !prompts.adjustSkills || !prompts.adjustEnchantments || !prompts.adjustPassiveSkills || !prompts.designPassiveSkills) {
        showResponse('错误：所有Prompt模板不能为空', true);
        return;
    }

    try {
        const response = await fetch('/api/prompts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prompts })
        });

        const data = await response.json();

        if (data.success) {
            showResponse('✅ Prompt模板已保存到文件', false, true);
        } else {
            showResponse(`错误：${data.error}`, true);
        }
    } catch (error) {
        console.error('保存prompt模板错误:', error);
        showResponse(`网络错误：${error.message}`, true);
    }
}

// 获取所有职业及其技能信息（用于构建prompt）
// excludeName: 要排除的职业名称（不包含在返回结果中）
function getAllProfessionsWithSkills(excludeName = null) {
    const professions = [];
    professionsList.querySelectorAll('.profession-item').forEach(item => {
        const nameInput = item.querySelector('.profession-name-input');
        if (!nameInput) return;
        
        const name = nameInput.value.trim();
        if (!name) return;
        
        // 排除目标职业
        if (excludeName && name === excludeName) {
            return;
        }

        const traitInput = item.querySelector('.profession-trait-input');
        const trait = traitInput ? traitInput.value.trim() : '';

        const skills = {};
        ['lv1', 'lv2', 'lv3', 'lv4', 'lv5'].forEach(level => {
            const skillInput = item.querySelector(`.skill-input[data-level="${level}"]`);
            if (skillInput) {
                skills[level] = skillInput.value.trim();
            }
        });

        professions.push({ name, trait, skills });
    });
    return professions;
}

// 设计常规技能
async function designSkills(button) {
    const professionItem = button.closest('.profession-item');
    const professionNameInput = professionItem.querySelector('.profession-name-input');
    const currentProfessionName = professionNameInput.value.trim();

    if (!currentProfessionName) {
        showResponse('错误：请先输入职业名称', true);
        return;
    }

    // 从模板中获取prompt
    const promptTemplate = designSkillsPromptInput.value.trim();
    if (!promptTemplate) {
        showResponse('错误：设计技能prompt模板不能为空', true);
        return;
    }

    // 获取所有职业及其技能信息（排除当前职业）
    const allProfessions = getAllProfessionsWithSkills(currentProfessionName);
    
    // 即使排除了当前职业，也应该有其他职业作为参考
    // 注意：这个提示会在prompt显示时被覆盖，所以暂时不显示
    // if (allProfessions.length === 0) {
    //     showResponse('提示：没有其他职业作为参考，将基于职业特征设计技能', false);
    // }

    // 构建职业列表字符串（%z）- 不包含目标职业
    const professionNames = allProfessions.map(p => p.name).join('、');

    // 构建技能信息字符串（%s）- 不包含目标职业
    const skillsInfo = allProfessions.map(p => {
        const skillsDesc = ['lv1', 'lv2', 'lv3', 'lv4', 'lv5']
            .map(level => {
                const skill = p.skills[level];
                return skill ? `${level}: ${skill}` : '';
            })
            .filter(s => s)
            .join('，');
        return `${p.name}的技能：${skillsDesc}`;
    }).join('；');

    // 获取目标职业的特征
    const traitInput = professionItem.querySelector('.profession-trait-input');
    const currentProfessionTrait = traitInput ? traitInput.value.trim() : '无特征';

    // 构建最终的prompt，替换占位符
    // 注意：先替换%z1和%tp1，再替换%z，避免%z1被误替换
    let prompt = promptTemplate;
    prompt = prompt.replace(/%z1/g, currentProfessionName);
    prompt = prompt.replace(/%tp1/g, currentProfessionTrait);
    prompt = prompt.replace(/%z/g, professionNames || '无');
    prompt = prompt.replace(/%s/g, skillsInfo || '无');

    // 禁用按钮，显示加载状态
    button.disabled = true;
    showLoading(`正在为"${currentProfessionName}"设计常规技能`);

    // 显示最终prompt用于调试
    const promptDiv = document.createElement('div');
    promptDiv.className = 'response-content';
    promptDiv.style.background = '#e3f2fd';
    promptDiv.style.padding = '15px';
    promptDiv.style.borderRadius = '5px';
    promptDiv.style.borderLeft = '4px solid #2196f3';
    promptDiv.style.marginBottom = '10px';
    promptDiv.innerHTML = `<strong>📝 最终Prompt：</strong><br><pre style="white-space: pre-wrap; word-wrap: break-word; margin-top: 10px;">${prompt}</pre>`;
    responseArea.innerHTML = '';
    responseArea.appendChild(promptDiv);

    try {
        const response = await fetch('/api/generate-skills', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                prompt: prompt,
                enableDeepThinking: deepThinkingToggle.checked
            })
        });

        const data = await response.json();

        if (data.success) {
            const responseDiv = document.createElement('div');
            responseDiv.className = 'response-content success';
            responseDiv.textContent = data.content;
            responseArea.appendChild(responseDiv);

            // 解析返回的技能JSON
            const skills = parseSkillsFromResponse(data.content);

            if (skills && Object.keys(skills).length > 0) {
                // 填充技能到输入框
                ['lv1', 'lv2', 'lv3', 'lv4', 'lv5'].forEach(level => {
                    const skillInput = professionItem.querySelector(`.skill-input[data-level="${level}"]`);
                    if (skillInput && skills[level]) {
                        skillInput.value = skills[level];
                    }
                });

                // 自动保存
                autoSave();

                const infoDiv = document.createElement('div');
                infoDiv.className = 'profession-added';
                infoDiv.textContent = `✅ 成功为"${currentProfessionName}"设计常规技能`;
                responseArea.appendChild(infoDiv);
            } else {
                const infoDiv = document.createElement('div');
                infoDiv.className = 'profession-added';
                infoDiv.textContent = '⚠️ 无法从响应中提取技能信息，请手动检查并添加';
                responseArea.appendChild(infoDiv);
            }
        } else {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'response-content error';
            errorDiv.textContent = `错误：${data.error}`;
            responseArea.appendChild(errorDiv);
        }
    } catch (error) {
        console.error('设计技能错误:', error);
        const errorDiv = document.createElement('div');
        errorDiv.className = 'response-content error';
        errorDiv.textContent = `网络错误：${error.message}`;
        responseArea.appendChild(errorDiv);
    } finally {
        button.disabled = false;
    }
}

// 解析技能JSON响应
function parseSkillsFromResponse(jsonString) {
    try {
        // 尝试直接解析
        const json = JSON.parse(jsonString);
        if (json.lv1 || json.lv2 || json.lv3 || json.lv4 || json.lv5) {
            return json;
        }
    } catch (e) {
        // 如果直接解析失败，尝试提取JSON部分
        const jsonMatch = jsonString.match(/\{[\s\S]*"lv[1-5]"[\s\S]*\}/);
        if (jsonMatch) {
            try {
                return JSON.parse(jsonMatch[0]);
            } catch (e2) {
                // 尝试更宽松的匹配
                const skills = {};
                ['lv1', 'lv2', 'lv3', 'lv4', 'lv5'].forEach(level => {
                    const match = jsonString.match(new RegExp(`"${level}"\\s*:\\s*"([^"]+)"`));
                    if (match && match[1]) {
                        skills[level] = match[1];
                    }
                });
                if (Object.keys(skills).length > 0) {
                    return skills;
                }
            }
        }
    }
    return null;
}

// 获取所有元素及其附魔信息（用于构建prompt）
// excludeName: 要排除的元素名称（不包含在返回结果中）
function getAllElementsWithEnchantments(excludeName = null) {
    const elements = [];
    elementsList.querySelectorAll('.element-item').forEach(item => {
        const nameInput = item.querySelector('.element-name-input');
        if (!nameInput) return;
        
        const name = nameInput.value.trim();
        if (!name) return;
        
        // 排除目标元素
        if (excludeName && name === excludeName) {
            return;
        }

        const enchantments = {};
        ['lv1', 'lv2', 'lv3', 'lv4', 'lv5'].forEach(level => {
            const enchantInput = item.querySelector(`.enchantment-input[data-level="${level}"]`);
            if (enchantInput) {
                enchantments[level] = enchantInput.value.trim();
            }
        });

        elements.push({ name, enchantments });
    });
    return elements;
}

// 设计附魔效果
async function designEnchantments(button) {
    const elementItem = button.closest('.element-item');
    const elementNameInput = elementItem.querySelector('.element-name-input');
    const currentElementName = elementNameInput.value.trim();

    if (!currentElementName) {
        showResponse('错误：请先输入元素名称', true);
        return;
    }

    // 从模板中获取prompt
    const promptTemplate = designEnchantmentsPromptInput.value.trim();
    if (!promptTemplate) {
        showResponse('错误：设计附魔prompt模板不能为空', true);
        return;
    }

    // 获取所有元素及其附魔信息（排除当前元素）
    const allElements = getAllElementsWithEnchantments(currentElementName);
    
    // 构建元素列表字符串（%y）- 不包含目标元素
    const elementNames = allElements.map(e => e.name).join('、');

    // 构建附魔信息字符串（%s）- 不包含目标元素
    const enchantmentsInfo = allElements.map(e => {
        const enchantmentsDesc = ['lv1', 'lv2', 'lv3', 'lv4', 'lv5']
            .map(level => {
                const enchantment = e.enchantments[level];
                return enchantment ? `${level}: ${enchantment}` : '';
            })
            .filter(s => s)
            .join('，');
        return `${e.name}的附魔：${enchantmentsDesc}`;
    }).join('；');

    // 获取目标元素的特征
    const traitInput = elementItem.querySelector('.element-trait-input');
    const currentElementTrait = traitInput ? traitInput.value.trim() : '无特征';

    // 构建最终的prompt，替换占位符
    // 注意：先替换%y1和%te1，再替换%y，避免%y1被误替换
    let prompt = promptTemplate;
    prompt = prompt.replace(/%y1/g, currentElementName);
    prompt = prompt.replace(/%te1/g, currentElementTrait);
    prompt = prompt.replace(/%y/g, elementNames || '无');
    prompt = prompt.replace(/%s/g, enchantmentsInfo || '无');

    // 禁用按钮，显示加载状态
    button.disabled = true;
    showLoading(`正在为"${currentElementName}"设计附魔效果`);

    // 显示最终prompt用于调试
    const promptDiv = document.createElement('div');
    promptDiv.className = 'response-content';
    promptDiv.style.background = '#e3f2fd';
    promptDiv.style.padding = '15px';
    promptDiv.style.borderRadius = '5px';
    promptDiv.style.borderLeft = '4px solid #2196f3';
    promptDiv.style.marginBottom = '10px';
    promptDiv.innerHTML = `<strong>📝 最终Prompt：</strong><br><pre style="white-space: pre-wrap; word-wrap: break-word; margin-top: 10px;">${prompt}</pre>`;
    responseArea.innerHTML = '';
    responseArea.appendChild(promptDiv);

    try {
        const response = await fetch('/api/generate-enchantments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                prompt: prompt,
                enableDeepThinking: deepThinkingToggle.checked
            })
        });

        const data = await response.json();

        if (data.success) {
            const responseDiv = document.createElement('div');
            responseDiv.className = 'response-content success';
            responseDiv.textContent = data.content;
            responseArea.appendChild(responseDiv);

            // 解析返回的附魔JSON（复用技能解析逻辑）
            const enchantments = parseSkillsFromResponse(data.content);

            if (enchantments && Object.keys(enchantments).length > 0) {
                // 填充附魔到输入框
                ['lv1', 'lv2', 'lv3', 'lv4', 'lv5'].forEach(level => {
                    const enchantInput = elementItem.querySelector(`.enchantment-input[data-level="${level}"]`);
                    if (enchantInput && enchantments[level]) {
                        enchantInput.value = enchantments[level];
                    }
                });

                // 自动保存
                autoSave();

                const infoDiv = document.createElement('div');
                infoDiv.className = 'profession-added';
                infoDiv.textContent = `✅ 成功为"${currentElementName}"设计附魔效果`;
                responseArea.appendChild(infoDiv);
            } else {
                const infoDiv = document.createElement('div');
                infoDiv.className = 'profession-added';
                infoDiv.textContent = '⚠️ 无法从响应中提取附魔信息，请手动检查并添加';
                responseArea.appendChild(infoDiv);
            }
        } else {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'response-content error';
            errorDiv.textContent = `错误：${data.error}`;
            responseArea.appendChild(errorDiv);
        }
    } catch (error) {
        console.error('设计附魔错误:', error);
        const errorDiv = document.createElement('div');
        errorDiv.className = 'response-content error';
        errorDiv.textContent = `网络错误：${error.message}`;
        responseArea.appendChild(errorDiv);
    } finally {
        button.disabled = false;
    }
}

// 调整技能
async function adjustSkills(button) {
    const professionItem = button.closest('.profession-item');
    const professionNameInput = professionItem.querySelector('.profession-name-input');
    const currentProfessionName = professionNameInput.value.trim();
    const adjustDirectionInput = professionItem.querySelector('.adjust-direction-input');
    const adjustDirection = adjustDirectionInput ? adjustDirectionInput.value.trim() : '';

    if (!currentProfessionName) {
        showResponse('错误：请先输入职业名称', true);
        return;
    }

    if (!adjustDirection) {
        showResponse('错误：请输入调整方向', true);
        return;
    }

    // 从模板中获取prompt
    const promptTemplate = adjustSkillsPromptInput.value.trim();
    if (!promptTemplate) {
        showResponse('错误：调整技能prompt模板不能为空', true);
        return;
    }

    // 获取目标职业的特征
    const traitInput = professionItem.querySelector('.profession-trait-input');
    const currentProfessionTrait = traitInput ? traitInput.value.trim() : '无特征';

    // 获取当前技能
    const currentSkills = {};
    ['lv1', 'lv2', 'lv3', 'lv4', 'lv5'].forEach(level => {
        const skillInput = professionItem.querySelector(`.skill-input[data-level="${level}"]`);
        if (skillInput) {
            currentSkills[level] = skillInput.value.trim();
        }
    });

    // 构建当前技能描述字符串
    const skillsDesc = ['lv1', 'lv2', 'lv3', 'lv4', 'lv5']
        .map(level => {
            const skill = currentSkills[level];
            return skill ? `${level}: ${skill}` : '';
        })
        .filter(s => s)
        .join('，');

    // 构建最终的prompt，替换占位符
    let prompt = promptTemplate;
    prompt = prompt.replace(/%z1/g, currentProfessionName);
    prompt = prompt.replace(/%tp1/g, currentProfessionTrait);
    prompt = prompt.replace(/%s1/g, skillsDesc || '无');
    prompt = prompt.replace(/%a/g, adjustDirection);

    // 禁用按钮，显示加载状态
    button.disabled = true;
    showLoading(`正在调整"${currentProfessionName}"的技能`);

    // 显示最终prompt用于调试
    const promptDiv = document.createElement('div');
    promptDiv.className = 'response-content';
    promptDiv.style.background = '#e3f2fd';
    promptDiv.style.padding = '15px';
    promptDiv.style.borderRadius = '5px';
    promptDiv.style.borderLeft = '4px solid #2196f3';
    promptDiv.style.marginBottom = '10px';
    promptDiv.innerHTML = `<strong>📝 最终Prompt：</strong><br><pre style="white-space: pre-wrap; word-wrap: break-word; margin-top: 10px;">${prompt}</pre>`;
    responseArea.innerHTML = '';
    responseArea.appendChild(promptDiv);

    try {
        const response = await fetch('/api/adjust-skills', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                prompt: prompt,
                enableDeepThinking: deepThinkingToggle.checked
            })
        });

        const data = await response.json();

        if (data.success) {
            const responseDiv = document.createElement('div');
            responseDiv.className = 'response-content success';
            responseDiv.textContent = data.content;
            responseArea.appendChild(responseDiv);

            // 解析返回的技能JSON
            const skills = parseSkillsFromResponse(data.content);

            if (skills && Object.keys(skills).length > 0) {
                // 替换技能到输入框
                ['lv1', 'lv2', 'lv3', 'lv4', 'lv5'].forEach(level => {
                    const skillInput = professionItem.querySelector(`.skill-input[data-level="${level}"]`);
                    if (skillInput && skills[level]) {
                        skillInput.value = skills[level];
                    }
                });

                // 自动保存
                autoSave();

                const infoDiv = document.createElement('div');
                infoDiv.className = 'profession-added';
                infoDiv.textContent = `✅ 成功调整"${currentProfessionName}"的技能`;
                responseArea.appendChild(infoDiv);
            } else {
                const infoDiv = document.createElement('div');
                infoDiv.className = 'profession-added';
                infoDiv.textContent = '⚠️ 无法从响应中提取技能信息，请手动检查并添加';
                responseArea.appendChild(infoDiv);
            }
        } else {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'response-content error';
            errorDiv.textContent = `错误：${data.error}`;
            responseArea.appendChild(errorDiv);
        }
    } catch (error) {
        console.error('调整技能错误:', error);
        const errorDiv = document.createElement('div');
        errorDiv.className = 'response-content error';
        errorDiv.textContent = `网络错误：${error.message}`;
        responseArea.appendChild(errorDiv);
    } finally {
        button.disabled = false;
    }
}

// 调整附魔
async function adjustEnchantments(button) {
    const elementItem = button.closest('.element-item');
    const elementNameInput = elementItem.querySelector('.element-name-input');
    const currentElementName = elementNameInput.value.trim();
    const adjustDirectionInput = elementItem.querySelector('.adjust-direction-input');
    const adjustDirection = adjustDirectionInput ? adjustDirectionInput.value.trim() : '';

    if (!currentElementName) {
        showResponse('错误：请先输入元素名称', true);
        return;
    }

    if (!adjustDirection) {
        showResponse('错误：请输入调整方向', true);
        return;
    }

    // 从模板中获取prompt
    const promptTemplate = adjustEnchantmentsPromptInput.value.trim();
    if (!promptTemplate) {
        showResponse('错误：调整附魔prompt模板不能为空', true);
        return;
    }

    // 获取目标元素的特征
    const traitInput = elementItem.querySelector('.element-trait-input');
    const currentElementTrait = traitInput ? traitInput.value.trim() : '无特征';

    // 获取当前附魔
    const currentEnchantments = {};
    ['lv1', 'lv2', 'lv3', 'lv4', 'lv5'].forEach(level => {
        const enchantInput = elementItem.querySelector(`.enchantment-input[data-level="${level}"]`);
        if (enchantInput) {
            currentEnchantments[level] = enchantInput.value.trim();
        }
    });

    // 构建当前附魔描述字符串
    const enchantmentsDesc = ['lv1', 'lv2', 'lv3', 'lv4', 'lv5']
        .map(level => {
            const enchantment = currentEnchantments[level];
            return enchantment ? `${level}: ${enchantment}` : '';
        })
        .filter(s => s)
        .join('，');

    // 构建最终的prompt，替换占位符
    let prompt = promptTemplate;
    prompt = prompt.replace(/%y1/g, currentElementName);
    prompt = prompt.replace(/%te1/g, currentElementTrait);
    prompt = prompt.replace(/%s1/g, enchantmentsDesc || '无');
    prompt = prompt.replace(/%a/g, adjustDirection);

    // 禁用按钮，显示加载状态
    button.disabled = true;
    showLoading(`正在调整"${currentElementName}"的附魔`);

    // 显示最终prompt用于调试
    const promptDiv = document.createElement('div');
    promptDiv.className = 'response-content';
    promptDiv.style.background = '#e3f2fd';
    promptDiv.style.padding = '15px';
    promptDiv.style.borderRadius = '5px';
    promptDiv.style.borderLeft = '4px solid #2196f3';
    promptDiv.style.marginBottom = '10px';
    promptDiv.innerHTML = `<strong>📝 最终Prompt：</strong><br><pre style="white-space: pre-wrap; word-wrap: break-word; margin-top: 10px;">${prompt}</pre>`;
    responseArea.innerHTML = '';
    responseArea.appendChild(promptDiv);

    try {
        const response = await fetch('/api/adjust-enchantments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                prompt: prompt,
                enableDeepThinking: deepThinkingToggle.checked
            })
        });

        const data = await response.json();

        if (data.success) {
            const responseDiv = document.createElement('div');
            responseDiv.className = 'response-content success';
            responseDiv.textContent = data.content;
            responseArea.appendChild(responseDiv);

            // 解析返回的附魔JSON（复用技能解析逻辑）
            const enchantments = parseSkillsFromResponse(data.content);

            if (enchantments && Object.keys(enchantments).length > 0) {
                // 替换附魔到输入框
                ['lv1', 'lv2', 'lv3', 'lv4', 'lv5'].forEach(level => {
                    const enchantInput = elementItem.querySelector(`.enchantment-input[data-level="${level}"]`);
                    if (enchantInput && enchantments[level]) {
                        enchantInput.value = enchantments[level];
                    }
                });

                // 自动保存
                autoSave();

                const infoDiv = document.createElement('div');
                infoDiv.className = 'profession-added';
                infoDiv.textContent = `✅ 成功调整"${currentElementName}"的附魔`;
                responseArea.appendChild(infoDiv);
            } else {
                const infoDiv = document.createElement('div');
                infoDiv.className = 'profession-added';
                infoDiv.textContent = '⚠️ 无法从响应中提取附魔信息，请手动检查并添加';
                responseArea.appendChild(infoDiv);
            }
        } else {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'response-content error';
            errorDiv.textContent = `错误：${data.error}`;
            responseArea.appendChild(errorDiv);
        }
    } catch (error) {
        console.error('调整附魔错误:', error);
        const errorDiv = document.createElement('div');
        errorDiv.className = 'response-content error';
        errorDiv.textContent = `网络错误：${error.message}`;
        responseArea.appendChild(errorDiv);
    } finally {
        button.disabled = false;
    }
}

// 设计被动技能
async function designPassiveSkills(button) {
    // 判断是职业还是元素
    const professionItem = button.closest('.profession-item');
    const elementItem = button.closest('.element-item');
    const item = professionItem || elementItem;
    
    if (!item) {
        showResponse('错误：无法找到对应的卡片', true);
        return;
    }

    const isProfession = !!professionItem;
    const nameInput = isProfession 
        ? item.querySelector('.profession-name-input')
        : item.querySelector('.element-name-input');
    const currentName = nameInput ? nameInput.value.trim() : '';

    if (!currentName) {
        showResponse(`错误：请先输入${isProfession ? '职业' : '元素'}名称`, true);
        return;
    }

    // 从模板中获取prompt
    const promptTemplate = designPassiveSkillsPromptInput.value.trim();
    if (!promptTemplate) {
        showResponse('错误：设计被动技能prompt模板不能为空', true);
        return;
    }

    // 获取特征
    const traitInput = isProfession
        ? item.querySelector('.profession-trait-input')
        : item.querySelector('.element-trait-input');
    const currentTrait = traitInput ? traitInput.value.trim() : '无特征';

    // 获取当前课程的常规技能（职业是skills，元素是enchantments）
    const currentSkills = {};
    if (isProfession) {
        ['lv1', 'lv2', 'lv3', 'lv4', 'lv5'].forEach(level => {
            const skillInput = item.querySelector(`.skill-input[data-level="${level}"]`);
            if (skillInput) {
                currentSkills[level] = skillInput.value.trim();
            }
        });
    } else {
        ['lv1', 'lv2', 'lv3', 'lv4', 'lv5'].forEach(level => {
            const enchantInput = item.querySelector(`.enchantment-input[data-level="${level}"]`);
            if (enchantInput) {
                currentSkills[level] = enchantInput.value.trim();
            }
        });
    }

    // 构建当前常规技能描述字符串
    const skillsDesc = ['lv1', 'lv2', 'lv3', 'lv4', 'lv5']
        .map(level => {
            const skill = currentSkills[level];
            return skill ? `${level}: ${skill}` : '';
        })
        .filter(s => s)
        .join('，');

    // 获取其他课程的被动技能（排除当前课程）
    const allPassiveSkills = [];
    if (isProfession) {
        professionsList.querySelectorAll('.profession-item').forEach(otherItem => {
            const otherNameInput = otherItem.querySelector('.profession-name-input');
            if (!otherNameInput) return;
            const otherName = otherNameInput.value.trim();
            if (!otherName || otherName === currentName) return;

            const otherPassiveSkills = {};
            ['skill1', 'skill2'].forEach(skill => {
                const passiveSkillInput = otherItem.querySelector(`.passive-skill-input[data-skill="${skill}"]`);
                if (passiveSkillInput) {
                    otherPassiveSkills[skill] = passiveSkillInput.value.trim();
                }
            });

            const passiveSkillsDesc = ['skill1', 'skill2']
                .map(skill => {
                    const skillText = otherPassiveSkills[skill];
                    return skillText ? `${skill}: ${skillText}` : '';
                })
                .filter(s => s)
                .join('，');

            if (passiveSkillsDesc) {
                allPassiveSkills.push(`${otherName}的被动技能：${passiveSkillsDesc}`);
            }
        });
    } else {
        elementsList.querySelectorAll('.element-item').forEach(otherItem => {
            const otherNameInput = otherItem.querySelector('.element-name-input');
            if (!otherNameInput) return;
            const otherName = otherNameInput.value.trim();
            if (!otherName || otherName === currentName) return;

            const otherPassiveSkills = {};
            ['skill1', 'skill2'].forEach(skill => {
                const passiveSkillInput = otherItem.querySelector(`.passive-skill-input[data-skill="${skill}"]`);
                if (passiveSkillInput) {
                    otherPassiveSkills[skill] = passiveSkillInput.value.trim();
                }
            });

            const passiveSkillsDesc = ['skill1', 'skill2']
                .map(skill => {
                    const skillText = otherPassiveSkills[skill];
                    return skillText ? `${skill}: ${skillText}` : '';
                })
                .filter(s => s)
                .join('，');

            if (passiveSkillsDesc) {
                allPassiveSkills.push(`${otherName}的被动技能：${passiveSkillsDesc}`);
            }
        });
    }

    const otherPassiveSkillsDesc = allPassiveSkills.join('；');

    // 构建最终的prompt，替换占位符
    let prompt = promptTemplate;
    prompt = prompt.replace(/%z1/g, currentName);
    prompt = prompt.replace(/%t1/g, currentTrait);
    prompt = prompt.replace(/%s1/g, skillsDesc || '无');
    prompt = prompt.replace(/%s/g, otherPassiveSkillsDesc || '无');

    // 禁用按钮，显示加载状态
    button.disabled = true;
    showLoading(`正在为"${currentName}"设计被动技能`);

    // 显示最终prompt用于调试
    const promptDiv = document.createElement('div');
    promptDiv.className = 'response-content';
    promptDiv.style.background = '#e3f2fd';
    promptDiv.style.padding = '15px';
    promptDiv.style.borderRadius = '5px';
    promptDiv.style.borderLeft = '4px solid #2196f3';
    promptDiv.style.marginBottom = '10px';
    promptDiv.innerHTML = `<strong>📝 最终Prompt：</strong><br><pre style="white-space: pre-wrap; word-wrap: break-word; margin-top: 10px;">${prompt}</pre>`;
    responseArea.innerHTML = '';
    responseArea.appendChild(promptDiv);

    try {
        const response = await fetch('/api/design-passive-skills', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                prompt: prompt,
                enableDeepThinking: deepThinkingToggle.checked
            })
        });

        const data = await response.json();

        if (data.success) {
            const responseDiv = document.createElement('div');
            responseDiv.className = 'response-content success';
            responseDiv.textContent = data.content;
            responseArea.appendChild(responseDiv);

            // 解析返回的被动技能JSON
            let passiveSkills = null;
            try {
                const json = JSON.parse(data.content);
                if (json.skill1 || json.skill2) {
                    passiveSkills = json;
                }
            } catch (e) {
                // 尝试提取JSON部分
                const jsonMatch = data.content.match(/\{[\s\S]*"skill[12]"[\s\S]*\}/);
                if (jsonMatch) {
                    try {
                        passiveSkills = JSON.parse(jsonMatch[0]);
                    } catch (e2) {
                        // 尝试更宽松的匹配
                        passiveSkills = {};
                        ['skill1', 'skill2'].forEach(skill => {
                            const match = data.content.match(new RegExp(`"${skill}"\\s*:\\s*"([^"]+)"`));
                            if (match && match[1]) {
                                passiveSkills[skill] = match[1];
                            }
                        });
                        if (Object.keys(passiveSkills).length === 0) {
                            passiveSkills = null;
                        }
                    }
                }
            }

            if (passiveSkills && Object.keys(passiveSkills).length > 0) {
                // 填充被动技能到输入框
                ['skill1', 'skill2'].forEach(skill => {
                    const passiveSkillInput = item.querySelector(`.passive-skill-input[data-skill="${skill}"]`);
                    if (passiveSkillInput && passiveSkills[skill]) {
                        passiveSkillInput.value = passiveSkills[skill];
                    }
                });

                // 自动保存
                autoSave();

                const infoDiv = document.createElement('div');
                infoDiv.className = 'profession-added';
                infoDiv.textContent = `✅ 成功为"${currentName}"设计被动技能`;
                responseArea.appendChild(infoDiv);
            } else {
                const infoDiv = document.createElement('div');
                infoDiv.className = 'profession-added';
                infoDiv.textContent = '⚠️ 无法从响应中提取被动技能信息，请手动检查并添加';
                responseArea.appendChild(infoDiv);
            }
        } else {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'response-content error';
            errorDiv.textContent = `错误：${data.error}`;
            responseArea.appendChild(errorDiv);
        }
    } catch (error) {
        console.error('设计被动技能错误:', error);
        const errorDiv = document.createElement('div');
        errorDiv.className = 'response-content error';
        errorDiv.textContent = `网络错误：${error.message}`;
        responseArea.appendChild(errorDiv);
    } finally {
        button.disabled = false;
    }
}

// 调整被动技能
async function adjustPassiveSkills(button) {
    // 判断是职业还是元素
    const professionItem = button.closest('.profession-item');
    const elementItem = button.closest('.element-item');
    const item = professionItem || elementItem;
    
    if (!item) {
        showResponse('错误：无法找到对应的卡片', true);
        return;
    }

    const isProfession = !!professionItem;
    const nameInput = isProfession 
        ? item.querySelector('.profession-name-input')
        : item.querySelector('.element-name-input');
    const currentName = nameInput ? nameInput.value.trim() : '';

    if (!currentName) {
        showResponse(`错误：请先输入${isProfession ? '职业' : '元素'}名称`, true);
        return;
    }

    const adjustDirectionInput = item.querySelector('.adjust-passive-direction-input');
    const adjustDirection = adjustDirectionInput ? adjustDirectionInput.value.trim() : '';

    if (!adjustDirection) {
        showResponse('错误：请输入调整方向', true);
        return;
    }

    // 从模板中获取prompt
    const promptTemplate = adjustPassiveSkillsPromptInput.value.trim();
    if (!promptTemplate) {
        showResponse('错误：调整被动技能prompt模板不能为空', true);
        return;
    }

    // 获取特征
    const traitInput = isProfession
        ? item.querySelector('.profession-trait-input')
        : item.querySelector('.element-trait-input');
    const currentTrait = traitInput ? traitInput.value.trim() : '无特征';

    // 获取当前被动技能
    const currentPassiveSkills = {};
    ['skill1', 'skill2'].forEach(skill => {
        const passiveSkillInput = item.querySelector(`.passive-skill-input[data-skill="${skill}"]`);
        if (passiveSkillInput) {
            currentPassiveSkills[skill] = passiveSkillInput.value.trim();
        }
    });

    // 构建当前被动技能描述字符串
    const passiveSkillsDesc = ['skill1', 'skill2']
        .map(skill => {
            const skillText = currentPassiveSkills[skill];
            return skillText ? `${skill}: ${skillText}` : '';
        })
        .filter(s => s)
        .join('，');

    // 构建最终的prompt，替换占位符
    let prompt = promptTemplate;
    prompt = prompt.replace(/%z1/g, currentName);
    prompt = prompt.replace(/%t1/g, currentTrait);
    prompt = prompt.replace(/%s1/g, passiveSkillsDesc || '无');
    prompt = prompt.replace(/%a/g, adjustDirection);

    // 禁用按钮，显示加载状态
    button.disabled = true;
    showLoading(`正在调整"${currentName}"的被动技能`);

    // 显示最终prompt用于调试
    const promptDiv = document.createElement('div');
    promptDiv.className = 'response-content';
    promptDiv.style.background = '#e3f2fd';
    promptDiv.style.padding = '15px';
    promptDiv.style.borderRadius = '5px';
    promptDiv.style.borderLeft = '4px solid #2196f3';
    promptDiv.style.marginBottom = '10px';
    promptDiv.innerHTML = `<strong>📝 最终Prompt：</strong><br><pre style="white-space: pre-wrap; word-wrap: break-word; margin-top: 10px;">${prompt}</pre>`;
    responseArea.innerHTML = '';
    responseArea.appendChild(promptDiv);

    try {
        const response = await fetch('/api/adjust-passive-skills', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                prompt: prompt,
                enableDeepThinking: deepThinkingToggle.checked
            })
        });

        const data = await response.json();

        if (data.success) {
            const responseDiv = document.createElement('div');
            responseDiv.className = 'response-content success';
            responseDiv.textContent = data.content;
            responseArea.appendChild(responseDiv);

            // 解析返回的被动技能JSON
            let passiveSkills = null;
            try {
                const json = JSON.parse(data.content);
                if (json.skill1 || json.skill2) {
                    passiveSkills = json;
                }
            } catch (e) {
                // 尝试提取JSON部分
                const jsonMatch = data.content.match(/\{[\s\S]*"skill[12]"[\s\S]*\}/);
                if (jsonMatch) {
                    try {
                        passiveSkills = JSON.parse(jsonMatch[0]);
                    } catch (e2) {
                        // 尝试更宽松的匹配
                        passiveSkills = {};
                        ['skill1', 'skill2'].forEach(skill => {
                            const match = data.content.match(new RegExp(`"${skill}"\\s*:\\s*"([^"]+)"`));
                            if (match && match[1]) {
                                passiveSkills[skill] = match[1];
                            }
                        });
                        if (Object.keys(passiveSkills).length === 0) {
                            passiveSkills = null;
                        }
                    }
                }
            }

            if (passiveSkills && Object.keys(passiveSkills).length > 0) {
                // 替换被动技能到输入框
                ['skill1', 'skill2'].forEach(skill => {
                    const passiveSkillInput = item.querySelector(`.passive-skill-input[data-skill="${skill}"]`);
                    if (passiveSkillInput && passiveSkills[skill]) {
                        passiveSkillInput.value = passiveSkills[skill];
                    }
                });

                // 自动保存
                autoSave();

                const infoDiv = document.createElement('div');
                infoDiv.className = 'profession-added';
                infoDiv.textContent = `✅ 成功调整"${currentName}"的被动技能`;
                responseArea.appendChild(infoDiv);
            } else {
                const infoDiv = document.createElement('div');
                infoDiv.className = 'profession-added';
                infoDiv.textContent = '⚠️ 无法从响应中提取被动技能信息，请手动检查并添加';
                responseArea.appendChild(infoDiv);
            }
        } else {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'response-content error';
            errorDiv.textContent = `错误：${data.error}`;
            responseArea.appendChild(errorDiv);
        }
    } catch (error) {
        console.error('调整被动技能错误:', error);
        const errorDiv = document.createElement('div');
        errorDiv.className = 'response-content error';
        errorDiv.textContent = `网络错误：${error.message}`;
        responseArea.appendChild(errorDiv);
    } finally {
        button.disabled = false;
    }
}

// 深度思考开关变化时保存
deepThinkingToggle.addEventListener('change', autoSave);

// 绑定事件
generateProfessionBtn.addEventListener('click', generateProfession);
generateElementBtn.addEventListener('click', generateElement);

// 将函数暴露到全局作用域
window.toggleSkills = toggleSkills;
window.toggleEnchantments = toggleEnchantments;
window.toggleSkillsByHeader = toggleSkillsByHeader;
window.toggleEnchantmentsByHeader = toggleEnchantmentsByHeader;
window.deleteProfession = deleteProfession;
window.deleteElement = deleteElement;
window.savePrompts = savePrompts;
window.designSkills = designSkills;
window.designEnchantments = designEnchantments;
window.adjustSkills = adjustSkills;
window.adjustEnchantments = adjustEnchantments;
window.designPassiveSkills = designPassiveSkills;
window.adjustPassiveSkills = adjustPassiveSkills;

// 页面加载完成时加载数据
window.addEventListener('load', () => {
    console.log('英雄学院战斗设计工具已加载');
    loadGameData();
    loadPrompts();
});
