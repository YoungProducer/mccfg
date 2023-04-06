export const getCreateQueryBuilderMock = <T>(response: T): any => ({
  select: () => getCreateQueryBuilderMock(response),
  addSelect: () => getCreateQueryBuilderMock(response),
  set: () => getCreateQueryBuilderMock(response),
  where: () => getCreateQueryBuilderMock(response),
  groupBy: () => getCreateQueryBuilderMock(response),
  update: () => getCreateQueryBuilderMock(response),
  getMany: () => response,
  execute: async () => {
    return;
  },
});
