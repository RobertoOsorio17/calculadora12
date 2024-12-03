// Función para tokenizar la ecuación
const tokenize = (equation) => {
  const tokens = [];
  let current = '';
  
  const isOperator = char => '+-*/^()='.includes(char);
  const isLetter = char => /[a-zA-Z]/.test(char);
  const isNumber = char => /[0-9.]/.test(char);
  
  for (let i = 0; i < equation.length; i++) {
    const char = equation[i];
    
    if (isOperator(char)) {
      if (current) {
        tokens.push(current);
        current = '';
      }
      tokens.push(char);
    } else if (isLetter(char)) {
      if (current && !isLetter(current[0])) {
        tokens.push(current);
        current = '';
      }
      current += char;
    } else if (isNumber(char)) {
      if (current && isLetter(current[0])) {
        tokens.push(current);
        current = '';
      }
      current += char;
    } else if (char !== ' ') {
      current += char;
    }
  }
  
  if (current) {
    tokens.push(current);
  }
  
  return tokens;
};

// Función para evaluar expresiones matemáticas con pasos
const evaluateExpression = (expression, variables) => {
  const steps = ['Evaluando expresión:'];
  steps.push(`1. Expresión original: ${expression}`);

  const tokens = tokenize(expression);
  steps.push(`2. Tokens identificados: ${tokens.join(' ')}`);

  const stack = [];
  let currentStep = 3;

  const applyOperator = (operator) => {
    const b = parseFloat(stack.pop());
    const a = parseFloat(stack.pop());
    let result;
    switch (operator) {
      case '+': result = a + b; break;
      case '-': result = a - b; break;
      case '*': result = a * b; break;
      case '/': result = a / b; break;
      case '^': result = Math.pow(a, b); break;
      default: throw new Error(`Operador desconocido: ${operator}`);
    }
    stack.push(result);
    steps.push(`${currentStep}. ${a} ${operator} ${b} = ${result}`);
    currentStep++;
  };

  for (const token of tokens) {
    if ('+-*/^'.includes(token)) {
      applyOperator(token);
    } else if (variables[token] !== undefined) {
      stack.push(variables[token]);
      steps.push(`${currentStep}. Variable ${token} = ${variables[token]}`);
      currentStep++;
    } else if (!isNaN(token)) {
      stack.push(parseFloat(token));
    } else {
      throw new Error(`Token inválido: ${token}`);
    }
  }

  const result = stack[0];
  steps.push(`${currentStep}. Resultado final: ${result}`);

  return {
    result,
    steps,
    type: 'expression'
  };
};

// Función para resolver ecuaciones lineales
const solveLinearEquation = (equation) => {
  const steps = ['Resolviendo ecuación lineal:'];
  steps.push(`1. Ecuación original: ${equation}`);

  const [leftSide, rightSide] = equation.split('=').map(side => side.trim());
  steps.push(`2. Separando la ecuación en dos lados: ${leftSide} = ${rightSide}`);
  
  // Separar términos con x y términos constantes
  const terms = tokenize(leftSide);
  let coefficient = 0;
  let constant = 0;
  
  for (let i = 0; i < terms.length; i++) {
    if (terms[i].includes('x')) {
      const coef = terms[i] === 'x' ? 1 : parseFloat(terms[i].replace('x', ''));
      coefficient += coef;
    } else if (!isNaN(terms[i])) {
      constant += parseFloat(terms[i]);
    }
  }

  steps.push(`3. Agrupando términos similares:`);
  steps.push(`   Coeficiente de x: ${coefficient}`);
  steps.push(`   Término constante: ${constant}`);
  
  const rightValue = parseFloat(rightSide);
  steps.push(`4. Valor del lado derecho: ${rightValue}`);

  // Mover términos
  const newConstant = rightValue - constant;
  steps.push(`5. Despejando x: ${coefficient}x = ${newConstant}`);

  const result = newConstant / coefficient;
  steps.push(`6. Resultado final: x = ${newConstant} ÷ ${coefficient} = ${result}`);

  return {
    result,
    steps,
    type: 'linear'
  };
};

// Función principal para resolver ecuaciones
export const solveEquation = (equationString) => {
  try {
    // Limpiar la ecuación
    const equation = equationString.replace(/\s+/g, '');
    
    // Detectar el tipo de ecuación y resolverla
    if (equation.includes('x') && !equation.includes('y')) {
      return solveLinearEquation(equation);
    } else if (equation.includes('y')) {
      throw new Error('Los sistemas de ecuaciones aún no están implementados');
    } else {
      return evaluateExpression(equation, {});
    }
  } catch (error) {
    throw new Error(`Error al resolver la ecuación: ${error.message}`);
  }
};

// Función para validar una ecuación
export const validateEquation = (equation) => {
  if (!equation) {
    throw new Error('La ecuación está vacía');
  }
  
  if (!equation.includes('=')) {
    throw new Error('La ecuación debe contener un signo igual (=)');
  }
  
  // Validar paréntesis balanceados
  const stack = [];
  for (const char of equation) {
    if (char === '(') {
      stack.push(char);
    } else if (char === ')') {
      if (stack.length === 0) {
        throw new Error('Paréntesis no balanceados');
      }
      stack.pop();
    }
  }
  
  if (stack.length > 0) {
    throw new Error('Paréntesis no balanceados');
  }
  
  // Validar operadores consecutivos
  if (/[+\-*/^]{2,}/.test(equation)) {
    throw new Error('Operadores consecutivos no válidos');
  }
  
  return true;
};

export default {
  solveEquation,
  validateEquation,
}; 