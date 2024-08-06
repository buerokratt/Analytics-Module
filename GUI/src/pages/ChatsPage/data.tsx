import {
  getAvgChatWaitingTime,
  getAvgMessagesInChats,
//   getCipChats,
  getDurationChats,
  getIdleChats,
  getTotalChats,
} from '../../resources/api-constants';
import { fetchChartData, fetchChartDataWithSubOptions } from '../../util/api-response-handler';
import { chatOptions } from './options';

export const fetchData = (config: any) => {
  switch (config.metric) {
    case 'total':
      return fetchChartDataWithSubOptions(getTotalChats(), config, chatOptions[0].subOptions!);
//     case 'cip':
//       return fetchChartDataWithSubOptions(getCipChats(), config, chatOptions[1].subOptions!);
    case 'avgConversationTime':
      return fetchChartData(getDurationChats(), config, chatOptions[2].labelKey);
    case 'avgWaitingTime':
      return fetchChartDataWithSubOptions(getAvgChatWaitingTime(), config, chatOptions[3].subOptions!);
    case 'avgNumOfMessages':
      return fetchChartData(getAvgMessagesInChats(), config, chatOptions[4].labelKey);
    case 'idle':
      return fetchChartData(getIdleChats(), config, chatOptions[5].labelKey);
    default:
      return [];
  }
};
