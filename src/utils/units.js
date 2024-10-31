const units = {
  volumen: {
    name: 'Volumen',
    units: [
      { valor: 1, label: 'Litros (L)', abreviatura: 'L' },
      { valor: 0.001, label: 'Mililitros (mL)', abreviatura: 'mL' },
      { valor: 1000, label: 'Metros cúbicos (m³)', abreviatura: 'm³' },
      { valor: 0.001, label: 'Centímetros cúbicos (cm³)', abreviatura: 'cm³' },
      { valor: 3.78541, label: 'Galones US (gal)', abreviatura: 'gal US' },
      { valor: 4.54609, label: 'Galones UK (gal)', abreviatura: 'gal UK' },
      { valor: 0.946353, label: 'Cuartos US (qt)', abreviatura: 'qt US' },
      { valor: 1.13652, label: 'Cuartos UK (qt)', abreviatura: 'qt UK' },
      { valor: 0.473176, label: 'Pintas US (pt)', abreviatura: 'pt US' },
      { valor: 0.568261, label: 'Pintas UK (pt)', abreviatura: 'pt UK' },
      { valor: 0.0295735, label: 'Onzas líquidas US (fl oz)', abreviatura: 'fl oz US' },
      { valor: 0.0284131, label: 'Onzas líquidas UK (fl oz)', abreviatura: 'fl oz UK' },
      { valor: 0.0147868, label: 'Cucharadas (tbsp)', abreviatura: 'tbsp' },
      { valor: 0.00492892, label: 'Cucharaditas (tsp)', abreviatura: 'tsp' },
      { valor: 158.987, label: 'Barriles de petróleo (bbl)', abreviatura: 'bbl' },
      { valor: 117.347, label: 'Barriles US (bbl US)', abreviatura: 'bbl US' },
      { valor: 0.0163871, label: 'Tazas métricas (cup)', abreviatura: 'cup' },
      { valor: 1000000, label: 'Kilómetros cúbicos (km³)', abreviatura: 'km³' },
      { valor: 0.000001, label: 'Milímetros cúbicos (mm³)', abreviatura: 'mm³' },
      { valor: 28.3168, label: 'Pies cúbicos (ft³)', abreviatura: 'ft³' },
      { valor: 0.0163871, label: 'Pulgadas cúbicas (in³)', abreviatura: 'in³' },
      { valor: 764.555, label: 'Yardas cúbicas (yd³)', abreviatura: 'yd³' }
    ]
  },
  longitud: {
    name: 'Longitud',
    units: [
      { valor: 1, label: 'Metros (m)', abreviatura: 'm' },
      { valor: 0.001, label: 'Milímetros (mm)', abreviatura: 'mm' },
      { valor: 0.01, label: 'Centímetros (cm)', abreviatura: 'cm' },
      { valor: 1000, label: 'Kilómetros (km)', abreviatura: 'km' },
      { valor: 0.0254, label: 'Pulgadas (in)', abreviatura: 'in' },
      { valor: 0.3048, label: 'Pies (ft)', abreviatura: 'ft' },
      { valor: 0.9144, label: 'Yardas (yd)', abreviatura: 'yd' },
      { valor: 1609.34, label: 'Millas (mi)', abreviatura: 'mi' },
      { valor: 1852, label: 'Millas náuticas (nmi)', abreviatura: 'nmi' }
    ]
  },
  masa: {
    name: 'Masa',
    units: [
      { valor: 1, label: 'Kilogramos (kg)', abreviatura: 'kg' },
      { valor: 0.001, label: 'Gramos (g)', abreviatura: 'g' },
      { valor: 0.000001, label: 'Miligramos (mg)', abreviatura: 'mg' },
      { valor: 1000, label: 'Toneladas (t)', abreviatura: 't' },
      { valor: 0.45359237, label: 'Libras (lb)', abreviatura: 'lb' },
      { valor: 0.028349523125, label: 'Onzas (oz)', abreviatura: 'oz' },
      { valor: 6.35029318, label: 'Stone (st)', abreviatura: 'st' },
      { valor: 0.00006479891, label: 'Granos (gr)', abreviatura: 'gr' }
    ]
  },
  temperatura: {
    name: 'Temperatura',
    units: [
      { valor: 1, label: 'Celsius (°C)', abreviatura: '°C' },
      { valor: 'K', label: 'Kelvin (K)', abreviatura: 'K' },
      { valor: 'F', label: 'Fahrenheit (°F)', abreviatura: '°F' }
    ],
    // Las conversiones de temperatura requieren fórmulas especiales
    formulas: {
      'C_to_K': (c) => c + 273.15,
      'K_to_C': (k) => k - 273.15,
      'C_to_F': (c) => (c * 9/5) + 32,
      'F_to_C': (f) => (f - 32) * 5/9,
      'K_to_F': (k) => (k - 273.15) * 9/5 + 32,
      'F_to_K': (f) => (f - 32) * 5/9 + 273.15
    }
  }
};

export default units; 