const solveEquation = (equation) => {
  try {
    equation = equation.replace(/\s+/g, '').toLowerCase();
    
    if (equation.includes('y')) {
      if (equation.includes(';')) {
        return solveSystemOfEquations(equation);
      }
      throw new Error(
        'Una ecuación con dos variables (x,y) tiene infinitas soluciones.\n' +
        'Para encontrar valores específicos, necesitas un sistema de dos ecuaciones.\n' +
        'Ejemplo: 2x+3y=5; 4x-y=1'
      );
    } else if (equation.includes('x²') || equation.includes('x^2')) {
      return solveQuadratic(equation);
    } else if (equation.includes('x')) {
      return solveLinear(equation);
    }
    
    throw new Error('Formato de ecuación no reconocido');
  } catch (error) {
    throw new Error(error.message);
  }
};

const solveSystemOfEquations = (equations) => {
  try {
    // Separamos las ecuaciones
    const [eq1, eq2] = equations.split(';');
    if (!eq1 || !eq2) {
      throw new Error('Se necesitan dos ecuaciones separadas por punto y coma (;)');
    }
    
    // Extraemos coeficientes (ax + by = c)
    const coef1 = extractCoefficients(eq1);
    const coef2 = extractCoefficients(eq2);
    
    // Método de Cramer
    const determinant = coef1.a * coef2.b - coef1.b * coef2.a;
    
    if (Math.abs(determinant) < 1e-10) {
      throw new Error('El sistema no tiene solución única');
    }
    
    const x = (coef1.c * coef2.b - coef1.b * coef2.c) / determinant;
    const y = (coef1.a * coef2.c - coef1.c * coef2.a) / determinant;
    
    return [{
      x: roundToDecimals(x, 4),
      y: roundToDecimals(y, 4),
      type: 'system',
      steps: [
        'Sistema de ecuaciones:',
        `${formatEquation(coef1)} = ${coef1.c}`,
        `${formatEquation(coef2)} = ${coef2.c}`,
        'Resolviendo por método de Cramer:',
        `Determinante = ${roundToDecimals(determinant, 4)}`,
        `x = ${roundToDecimals(x, 4)}`,
        `y = ${roundToDecimals(y, 4)}`
      ]
    }];
  } catch (error) {
    throw new Error(`Error al resolver el sistema: ${error.message}`);
  }
};

const extractCoefficients = (equation) => {
  try {
    const sides = equation.split('=');
    if (sides.length !== 2) {
      throw new Error('La ecuación debe tener un signo =');
    }
    
    const left = sides[0];
    const right = sides[1];
    
    let a = 0, b = 0, c = parseFloat(right) || 0;
    
    const terms = left.match(/[+-]?\d*x|[+-]?\d*y|[+-]?\d+/g) || [];
    
    terms.forEach(term => {
      if (term.includes('x')) {
        a += term === 'x' ? 1 : term === '-x' ? -1 : parseFloat(term.replace('x', ''));
      } else if (term.includes('y')) {
        b += term === 'y' ? 1 : term === '-y' ? -1 : parseFloat(term.replace('y', ''));
      } else {
        c -= parseFloat(term);
      }
    });
    
    return { a, b, c };
  } catch (error) {
    throw new Error(`Error al extraer coeficientes: ${error.message}`);
  }
};

const roundToDecimals = (num, decimals) => {
  const factor = Math.pow(10, decimals);
  return Math.round(num * factor) / factor;
};

const formatEquation = (coef) => {
  const formatTerm = (coefficient, variable) => {
    if (coefficient === 0) return '';
    if (coefficient === 1) return `+${variable}`;
    if (coefficient === -1) return `-${variable}`;
    return `${coefficient > 0 ? '+' : ''}${coefficient}${variable}`;
  };

  let equation = formatTerm(coef.a, 'x');
  equation += formatTerm(coef.b, 'y');
  
  // Eliminar el + inicial si existe
  return equation.startsWith('+') ? equation.substring(1) : equation;
};

const solveLinear = (equation) => {
  try {
    let sides = equation.split('=');
    if (sides.length !== 2) throw new Error('La ecuación debe tener un signo =');
    
    let left = sides[0];
    let right = sides[1];
    
    // Coeficientes
    let a = 0; // coeficiente de x
    let b = 0; // término independiente
    
    // Procesamos términos con x
    let terms = (left + '-' + right).match(/[+-]?\d*x|[+-]?\d+/g);
    if (!terms) throw new Error('Formato de ecuación inválido');
    
    terms.forEach(term => {
      if (term.includes('x')) {
        a += term === 'x' ? 1 : term === '-x' ? -1 : parseFloat(term.replace('x', ''));
      } else {
        b += parseFloat(term);
      }
    });
    
    if (a === 0) throw new Error('No es una ecuación lineal válida (coeficiente de x es 0)');
    
    const x = -b / a;
    return [{
      x: roundToDecimals(x, 4),
      type: 'real',
      steps: [
        'Ecuación lineal:',
        `${a}x + ${b} = 0`,
        `x = ${roundToDecimals(x, 4)}`
      ]
    }];
  } catch (error) {
    throw new Error(`Error en ecuación lineal: ${error.message}`);
  }
};

const solveQuadratic = (equation) => {
  try {
    let a = 0, b = 0, c = 0;
    
    let sides = equation.split('=');
    if (sides.length !== 2) throw new Error('La ecuación debe tener un signo =');
    
    let left = sides[0];
    let right = sides[1];
    
    let terms = (left + '-' + right).match(/[+-]?\d*x²|[+-]?\d*x|[+-]?\d+/g);
    if (!terms) throw new Error('Formato de ecuación inválido');
    
    terms.forEach(term => {
      if (term.includes('x²')) {
        a += term === 'x²' ? 1 : term === '-x²' ? -1 : parseFloat(term.replace('x²', ''));
      } else if (term.includes('x')) {
        b += term === 'x' ? 1 : term === '-x' ? -1 : parseFloat(term.replace('x', ''));
      } else {
        c += parseFloat(term);
      }
    });
    
    if (a === 0) throw new Error('No es una ecuación cuadrática válida (coeficiente de x² es 0)');
    
    const discriminant = b * b - 4 * a * c;
    const steps = [
      'Ecuación cuadrática:',
      `${a}x² + ${b}x + ${c} = 0`,
      `Discriminante = ${discriminant}`
    ];
    
    if (discriminant > 0) {
      const x1 = (-b + Math.sqrt(discriminant)) / (2 * a);
      const x2 = (-b - Math.sqrt(discriminant)) / (2 * a);
      steps.push(`x₁ = ${roundToDecimals(x1, 4)}`, `x₂ = ${roundToDecimals(x2, 4)}`);
      return [
        { x: roundToDecimals(x1, 4), type: 'real', steps },
        { x: roundToDecimals(x2, 4), type: 'real', steps }
      ];
    } else if (discriminant === 0) {
      const x = -b / (2 * a);
      steps.push(`x = ${roundToDecimals(x, 4)}`);
      return [{ x: roundToDecimals(x, 4), type: 'real', steps }];
    } else {
      const realPart = -b / (2 * a);
      const imagPart = Math.sqrt(-discriminant) / (2 * a);
      steps.push(
        `x₁ = ${roundToDecimals(realPart, 4)} + ${roundToDecimals(imagPart, 4)}i`,
        `x₂ = ${roundToDecimals(realPart, 4)} - ${roundToDecimals(imagPart, 4)}i`
      );
      return [
        { x: `${roundToDecimals(realPart, 4)} + ${roundToDecimals(imagPart, 4)}i`, type: 'complex', steps },
        { x: `${roundToDecimals(realPart, 4)} - ${roundToDecimals(imagPart, 4)}i`, type: 'complex', steps }
      ];
    }
  } catch (error) {
    throw new Error(`Error en ecuación cuadrática: ${error.message}`);
  }
};

export default solveEquation; 