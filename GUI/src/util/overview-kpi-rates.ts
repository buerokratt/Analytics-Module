export interface OverviewKpiRateInputs {
  readonly byk: number;
  readonly csa: number;
  readonly leftWithoutAnswer: number;
  readonly multiCsaChats: number;
  readonly totalCsaChats: number;
  readonly avgWaitingTime: number;
  readonly avgRating: number;
}

export interface OverviewKpiRates {
  readonly totalChats: number;
  readonly avgWaitingTime: number;
  readonly avgRating: number;
  readonly burokrattRate: number;
  readonly csaRate: number;
  readonly redirectedRate: number;
  readonly leftWithoutAnswerRate: number;
}

export const computeOverviewKpiRates = (inputs: OverviewKpiRateInputs): OverviewKpiRates => {
  const totalChats = inputs.byk + inputs.csa;
  return {
    totalChats,
    avgWaitingTime: inputs.avgWaitingTime,
    avgRating: inputs.avgRating,
    burokrattRate: totalChats > 0 ? (inputs.byk / totalChats) * 100 : 0,
    csaRate: totalChats > 0 ? (inputs.csa / totalChats) * 100 : 0,
    redirectedRate: inputs.totalCsaChats > 0 ? (inputs.multiCsaChats / inputs.totalCsaChats) * 100 : 0,
    leftWithoutAnswerRate: totalChats > 0 ? (inputs.leftWithoutAnswer / totalChats) * 100 : 0,
  };
};
