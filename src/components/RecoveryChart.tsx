"use client";

import { useEffect, useRef } from "react";
import * as echarts from "echarts/core";
import { BarChart } from "echarts/charts";
import { GridComponent, TooltipComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import { formatHectares, recoveryAreas } from "@/src/data/project";

echarts.use([BarChart, GridComponent, TooltipComponent, CanvasRenderer]);

const shortLabels: Record<string, string> = {
  "Nascentes do Potengi": "Nascentes do Potengi",
  "APP do Açude Eloy de Souza": "APP do Açude Eloy",
  "Fazenda Mundo Novo": "Fazenda Mundo Novo",
  "Açude do Bêbado - Escola Agrícola de Jundiaí": "Açude do Bêbado · EAJ"
};

export default function RecoveryChart() {
  const chartRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    const chart = echarts.init(chartRef.current);
    chart.setOption({
      animationDuration: 500,
      tooltip: { trigger: "axis", axisPointer: { type: "shadow" }, valueFormatter: (value: number) => formatHectares(value) },
      grid: { left: 8, right: 54, top: 8, bottom: 4, containLabel: true },
      xAxis: {
        type: "value",
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: "#71868b", fontSize: 10 },
        splitLine: { lineStyle: { color: "rgba(16, 52, 61, 0.09)" } }
      },
      yAxis: {
        type: "category",
        inverse: true,
        data: recoveryAreas.map((item) => item.area),
        axisTick: { show: false },
        axisLine: { show: false },
        axisLabel: {
          color: "#17333a",
          width: 132,
          overflow: "truncate",
          fontWeight: 700,
          formatter: (value: string) => shortLabels[value] ?? value
        }
      },
      series: [
        {
          type: "bar",
          data: recoveryAreas.map((item) => item.hectares),
          barWidth: 18,
          itemStyle: { color: "#238d57", borderRadius: [0, 4, 4, 0] },
          label: {
            show: true,
            position: "right",
            formatter: ({ value }: { value: number }) => formatHectares(value),
            color: "#36565e",
            fontSize: 11,
            fontWeight: 700
          }
        }
      ]
    });

    const resize = () => chart.resize();
    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
      chart.dispose();
    };
  }, []);

  return <div ref={chartRef} className="recovery-chart" role="img" aria-label="Gráfico das quatro áreas de recuperação em hectares" />;
}
