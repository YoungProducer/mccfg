import { Controller, Get, Res, Req, Inject } from '@nestjs/common';
import { Request, Response } from 'express';
import { parse } from 'url';

import { ViewService } from './view.service';
import { join } from 'path';
import getConfig from 'next/config';
import { EnvConfig } from '../config/interfaces';
import { DI_CONFIG } from '../config/constants';

@Controller('/')
export class ViewController {
  constructor(
    @Inject(DI_CONFIG)
    private config: EnvConfig,

    private viewService: ViewService,
  ) {}

  async handler(req: Request, res: Response) {
    const parsedUrl = parse(req.url, true);
    await this.viewService
      .getNextServer()
      .render(req, res, parsedUrl.pathname, parsedUrl.query);
  }

  @Get('')
  public async showHome(@Req() req: Request, @Res() res: Response) {
    console.log(this.config);

    const parsedUrl = parse(req.url, true);
    const serverSideProps = { title: '123' };

    await this.viewService
      .getNextServer()
      .render(req, res, parsedUrl.pathname, serverSideProps);
  }

  @Get('_next*')
  public async assets(@Req() req: Request, @Res() res: Response) {
    const parsedUrl = parse(req.url, true);
    await this.viewService
      .getNextServer()
      .render(req, res, parsedUrl.pathname, parsedUrl.query);
  }

  @Get(['*.ico', '*.svg'])
  public async favicon(@Req() req: Request, @Res() res: Response) {
    const parsedUrl = parse(req.url, true);

    res.sendFile(
      join(
        getConfig().serverRuntimeConfig.PROJECT_ROOT,
        'public',
        parsedUrl.pathname,
      ),
    );
  }
}
