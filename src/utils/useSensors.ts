import { useState, useEffect, useRef, useCallback } from 'react';
import { AquariumTheme, LightMode, SensorTelemetry } from '../types/aquarium';
import { audioEngine } from './audioEngine';

export function useSensors(
  currentTheme: AquariumTheme,
  lightMode: LightMode,
  aeratorIntensity: number,
  waterCurrentSpeed: number,
  tankCleanliness: number
) {
  // Base values calculation according to theme and ambient light
  const getBaseTemp = useCallback(() => {
    let base = currentTheme.waterTemperature;
    if (lightMode === 'day') base += 0.25;
    if (lightMode === 'sunset') base += 0.05;
    if (lightMode === 'night') base -= 0.35;
    if (lightMode === 'abyss') base -= 0.7;
    return base;
  }, [currentTheme.waterTemperature, lightMode]);

  const getBaseHumidity = useCallback(() => {
    // Relative canopy surface humidity: baseline ~67%, higher with warm water and bubbling
    const tempInfluence = (currentTheme.waterTemperature - 24) * 0.4;
    const aerationInfluence = aeratorIntensity * 3.5;
    return Math.min(85, Math.max(50, 67 + tempInfluence + aerationInfluence));
  }, [currentTheme.waterTemperature, aeratorIntensity]);

  const getBaseOxygen = useCallback(() => {
    // Dissolved oxygen in mg/L (normal aquatic range: 6.0 - 9.5 mg/L)
    const aerationLift = aeratorIntensity * 2.4;
    const currentLift = (waterCurrentSpeed - 1.0) * 0.4;
    return Math.min(9.8, Math.max(5.5, 6.2 + aerationLift + currentLift));
  }, [aeratorIntensity, waterCurrentSpeed]);

  const getBaseSalinityAndTds = useCallback(() => {
    if (currentTheme.id === 'coral-reef' || currentTheme.id === 'bioluminescent-abyss') {
      return { salinityPpt: 35.2, tdsPpm: 34800 };
    }
    // Freshwater
    return { salinityPpt: 0.1, tdsPpm: 142 };
  }, [currentTheme.id]);

  const [isCalibrating, setIsCalibrating] = useState(false);
  const [tempUnit, setTempUnit] = useState<'C' | 'F'>('C');
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Initialize state
  const [telemetry, setTelemetry] = useState<SensorTelemetry>(() => {
    const baseT = currentTheme.waterTemperature;
    const baseH = 68.0;
    const basePh = currentTheme.phLevel;
    const baseOx = 7.8;
    const { salinityPpt, tdsPpm } = currentTheme.id.includes('coral') || currentTheme.id.includes('abyss')
      ? { salinityPpt: 35.2, tdsPpm: 34800 }
      : { salinityPpt: 0.1, tdsPpm: 142 };

    return {
      waterTempC: baseT,
      waterTempF: parseFloat(((baseT * 9) / 5 + 32).toFixed(1)),
      ambientTempC: parseFloat((baseT - 1.8).toFixed(1)),
      ambientTempF: parseFloat((((baseT - 1.8) * 9) / 5 + 32).toFixed(1)),
      humidityPercent: baseH,
      phLevel: basePh,
      dissolvedOxygenMgL: baseOx,
      salinityPpt,
      tdsPpm,
      clarityPercent: tankCleanliness,
      isCalibrating: false,
      history: {
        temp: [baseT, baseT, baseT, baseT, baseT],
        humidity: [baseH, baseH, baseH, baseH, baseH],
        ph: [basePh, basePh, basePh, basePh, basePh],
        oxygen: [baseOx, baseOx, baseOx, baseOx, baseOx],
      },
      lastSync: new Date(),
    };
  });

  const tickRef = useRef(0);

  // Periodic subtle sensor drift / simulated telemetry readouts
  useEffect(() => {
    const timer = setInterval(() => {
      tickRef.current += 1;
      const t = tickRef.current;

      const baseT = getBaseTemp();
      const baseH = getBaseHumidity();
      const baseOx = getBaseOxygen();
      const { salinityPpt, tdsPpm } = getBaseSalinityAndTds();

      // Subtle sinusoidal sensor noise (digital probe jitter)
      const noiseT = Math.sin(t * 0.3) * 0.08 + (Math.random() - 0.5) * 0.04;
      const noiseH = Math.cos(t * 0.25) * 0.4 + (Math.random() - 0.5) * 0.2;
      const noisePh = Math.sin(t * 0.2) * 0.02 + (Math.random() - 0.5) * 0.01;
      const noiseOx = Math.cos(t * 0.35) * 0.06 + (Math.random() - 0.5) * 0.03;

      const currentT = parseFloat((baseT + noiseT).toFixed(1));
      const currentTF = parseFloat(((currentT * 9) / 5 + 32).toFixed(1));
      const ambientT = parseFloat((currentT - 1.6 + Math.sin(t * 0.1) * 0.2).toFixed(1));
      const ambientTF = parseFloat(((ambientT * 9) / 5 + 32).toFixed(1));
      const currentH = parseFloat(Math.min(99, Math.max(30, baseH + noiseH)).toFixed(1));
      const currentPh = parseFloat((currentTheme.phLevel + noisePh).toFixed(2));
      const currentOx = parseFloat(Math.min(10, Math.max(4.5, baseOx + noiseOx)).toFixed(2));

      setTelemetry((prev) => {
        const nextTempHistory = [...prev.history.temp.slice(-9), currentT];
        const nextHumidityHistory = [...prev.history.humidity.slice(-9), currentH];
        const nextPhHistory = [...prev.history.ph.slice(-9), currentPh];
        const nextOxHistory = [...prev.history.oxygen.slice(-9), currentOx];

        return {
          waterTempC: currentT,
          waterTempF: currentTF,
          ambientTempC: ambientT,
          ambientTempF: ambientTF,
          humidityPercent: currentH,
          phLevel: currentPh,
          dissolvedOxygenMgL: currentOx,
          salinityPpt: parseFloat((salinityPpt + (Math.random() - 0.5) * 0.05).toFixed(1)),
          tdsPpm: Math.round(tdsPpm + (Math.random() - 0.5) * 4),
          clarityPercent: parseFloat(tankCleanliness.toFixed(1)),
          isCalibrating: prev.isCalibrating,
          history: {
            temp: nextTempHistory,
            humidity: nextHumidityHistory,
            ph: nextPhHistory,
            oxygen: nextOxHistory,
          },
          lastSync: new Date(),
        };
      });
    }, 1500);

    return () => clearInterval(timer);
  }, [currentTheme.phLevel, getBaseTemp, getBaseHumidity, getBaseOxygen, getBaseSalinityAndTds, tankCleanliness]);

  // Recalibrate simulated probes
  const calibrateProbes = useCallback(() => {
    setIsCalibrating(true);
    audioEngine.playGrowthChime();

    setTimeout(() => {
      const baseT = getBaseTemp();
      const baseH = getBaseHumidity();
      const baseOx = getBaseOxygen();
      const { salinityPpt, tdsPpm } = getBaseSalinityAndTds();

      setTelemetry((prev) => ({
        ...prev,
        waterTempC: parseFloat(baseT.toFixed(1)),
        waterTempF: parseFloat(((baseT * 9) / 5 + 32).toFixed(1)),
        humidityPercent: parseFloat(baseH.toFixed(1)),
        phLevel: parseFloat(currentTheme.phLevel.toFixed(2)),
        dissolvedOxygenMgL: parseFloat(baseOx.toFixed(2)),
        salinityPpt,
        tdsPpm,
        isCalibrating: false,
        lastSync: new Date(),
      }));
      setIsCalibrating(false);
      audioEngine.playWaterPlop(200);
    }, 1200);
  }, [getBaseTemp, getBaseHumidity, getBaseOxygen, getBaseSalinityAndTds, currentTheme.phLevel]);

  return {
    telemetry,
    tempUnit,
    setTempUnit,
    isCollapsed,
    setIsCollapsed,
    isCalibrating,
    calibrateProbes,
  };
}
