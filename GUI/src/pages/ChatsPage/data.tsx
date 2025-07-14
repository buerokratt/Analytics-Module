import {
  getAvgChatWaitingTime,
  getAvgMessagesInChats,
  getCipChats,
  getDurationChats,
  getBykEndedChats,
  getTotalChats,
} from '../../resources/api-constants';
import { fetchChartData, fetchChartDataWithSubOptions } from '../../util/api-response-handler';
import { chatOptions } from './options';
import useStore from "../../store/user/store";

export const fetchData = (config: any) => {
  const userDomains = useStore.getState().userDomains;
  const multiDomainEnabled = import.meta.env.REACT_APP_ENABLE_MULTI_DOMAIN.toLowerCase() === 'true';
  config.urls = multiDomainEnabled ? userDomains || [null] : [];

  switch (config.metric) {
    case 'total':
      return fetchChartDataWithSubOptions(getTotalChats(), config, chatOptions[0].subOptions!);
    case 'cip':
      return fetchChartDataWithSubOptions(getCipChats(), config, chatOptions[1].subOptions!);
    case 'avgConversationTime':
      return fetchChartData(getDurationChats(), config, chatOptions[2].labelKey);
    case 'avgWaitingTime':
      return fetchChartDataWithSubOptions(getAvgChatWaitingTime(), config, chatOptions[3].subOptions!);
    case 'avgNumOfMessages':
      return fetchChartData(getAvgMessagesInChats(), config, chatOptions[4].labelKey);
    case 'idle':
      return fetchChartData(getBykEndedChats(), config, chatOptions[5].labelKey);
    default:
      return [];
  }
};
