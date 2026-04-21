import { Controller, Get, Header } from '@nestjs/common';
import { UiService } from './ui.service';

@Controller()
export class UiController {
  constructor(private readonly uiService: UiService) {}

  @Get()
  @Header('Content-Type', 'text/html; charset=utf-8')
  getHome() {
    return this.uiService.getIndexHtml();
  }

  @Get('ui/styles.css')
  @Header('Content-Type', 'text/css; charset=utf-8')
  getStyles() {
    return this.uiService.getStyles();
  }

  @Get('ui/app.js')
  @Header('Content-Type', 'application/javascript; charset=utf-8')
  getScript() {
    return this.uiService.getAppScript();
  }
}
