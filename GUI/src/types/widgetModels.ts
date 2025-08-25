export interface WDomain {
  name: string;
  url: string;
  active?: boolean;
  domainId: string;
}

export interface DomainSelection {
  id: string;
  name: string;
  url: string;
  selected: boolean;
}