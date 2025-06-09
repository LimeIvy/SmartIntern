export interface Ticket {
  id: string;
  title: string;
  description: string;
}

export interface List {
  id: string;
  title: string;
  tickets: Ticket[];
}

export interface ProjectDetail {
  id: string;
  name: string;
  description: string;
  image_url: string;
  lists: List[];
}
