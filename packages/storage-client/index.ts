export class StorageClient {
    private baseUrl: string;
    private authToken: string;
  
    constructor(baseUrl: string, authToken: string) {
      this.baseUrl = baseUrl;
      this.authToken = authToken;
    }
  
    async uploadImage(file: File, path: string): Promise<{ success: boolean; url: string; key: string }> {
      const response = await fetch(`${this.baseUrl}/${path}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
          'Content-Type': file.type,
        },
        body: file,
      });
  
      return response.json();
    }
  
    async deleteImage(path: string): Promise<boolean> {
      const response = await fetch(`${this.baseUrl}/${path}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
        },
      });
  
      return response.ok;
    }
  
    getImageUrl(path: string): string {
      return `${this.baseUrl}/${path}`;
    }
  }
  