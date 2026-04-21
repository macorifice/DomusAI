import { Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';

@Injectable()
export class UiService {
  private readonly assetsPath = join(process.cwd(), 'src', 'ui', 'assets');

  getIndexHtml(): string {
    return readFileSync(join(this.assetsPath, 'index.html'), 'utf8');
  }

  getStyles(): string {
    return readFileSync(join(this.assetsPath, 'styles.css'), 'utf8');
  }

  getAppScript(): string {
    return readFileSync(join(this.assetsPath, 'app.js'), 'utf8');
  }
}
