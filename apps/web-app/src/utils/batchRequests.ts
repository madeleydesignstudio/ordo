export class BatchLoader<T> {
  private batch: Promise<T>[] = [];
  private timeout: NodeJS.Timeout | null = null;

  constructor(private batchTime: number = 50) {}

  add(request: Promise<T>): Promise<T> {
    this.batch.push(request);

    if (!this.timeout) {
      this.timeout = setTimeout(() => this.flush(), this.batchTime);
    }

    return request;
  }

  private async flush() {
    const currentBatch = [...this.batch];
    this.batch = [];
    this.timeout = null;

    await Promise.all(currentBatch);
  }
}

export const journalBatcher = new BatchLoader();
export const todoBatcher = new BatchLoader();
