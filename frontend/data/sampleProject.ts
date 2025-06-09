import { ProjectDetail } from "@/types/project";

// サンプルデータ
export const sampleProjectData: ProjectDetail = {
  id: "PJ1",
  name: "Project 1",
  description: "This is project 1",
  image_url: "",
  lists: [
    {
      id: "L1",
      title: "興味あり",
      tickets: [
        { id: "T1", title: "Ticket 1", description: "This is ticket 1" },
        { id: "T2", title: "Ticket 2", description: "This is ticket 2" },
        { id: "T3", title: "Ticket 3", description: "This is ticket 3" },
      ],
    },
    {
      id: "L2",
      title: "書類選考中",
      tickets: [
        { id: "T4", title: "Ticket 4", description: "This is ticket 4" },
        { id: "T5", title: "Ticket 5", description: "This is ticket 5" },
        { id: "T6", title: "Ticket 6", description: "This is ticket 6" },
      ],
    },
    {
      id: "L3",
      title: "Webテスト",
      tickets: [
        { id: "T7", title: "Ticket 7", description: "This is ticket 7" },
        { id: "T8", title: "Ticket 8", description: "This is ticket 8" },
        { id: "T9", title: "Ticket 9", description: "This is ticket 9" },
      ],
    },
    {
      id: "L4",
      title: "1次面接",
      tickets: [
        { id: "T10", title: "Ticket 10", description: "This is ticket 10" },
        { id: "T11", title: "Ticket 11", description: "This is ticket 11" },
      ],
    },
    {
      id: "L5",
      title: "2次面接",
      tickets: [
        { id: "T12", title: "Ticket 12", description: "This is ticket 12" },
      ],
    },
    {
      id: "L6",
      title: "内定",
      tickets: [
        { id: "T13", title: "Ticket 13", description: "This is ticket 13" },
      ],
    },
    {
      id: "L7",
      title: "お祈り",
      tickets: [
        { id: "T13", title: "Ticket 13", description: "This is ticket 13" },
      ],
    },
  ],
};
