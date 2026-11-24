import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.setup';
import { PrismaService } from '../src/prisma/prisma.service';

const ownerEmail = 'docspace.test.owner@example.com';
const viewerEmail = 'docspace.test.viewer@example.com';
const password = 'Demo123!';

const content = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [{ type: 'text', text: 'Shared authorization test' }],
    },
  ],
};

describe('Document sharing authorization (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let owner: ReturnType<typeof request.agent>;
  let viewer: ReturnType<typeof request.agent>;
  let viewerId: string;
  let documentId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication<NestExpressApplication>();
    configureApp(app as NestExpressApplication);
    await app.init();

    prisma = app.get(PrismaService);
    await prisma.user.deleteMany({
      where: { email: { in: [ownerEmail, viewerEmail] } },
    });

    owner = request.agent(app.getHttpServer());
    viewer = request.agent(app.getHttpServer());

    await owner
      .post('/api/auth/register')
      .send({ name: 'Test Owner', email: ownerEmail, password })
      .expect(201);

    const viewerRegistration = await viewer
      .post('/api/auth/register')
      .send({ name: 'Test Viewer', email: viewerEmail, password })
      .expect(201);

    viewerId = viewerRegistration.body.data.user.id;
  });

  afterAll(async () => {
    if (prisma) {
      await prisma.user.deleteMany({
        where: { email: { in: [ownerEmail, viewerEmail] } },
      });
    }
    if (app) {
      await app.close();
    }
  });

  it('allows an owner to share, then enforces VIEWER and EDITOR permissions', async () => {
    const created = await owner
      .post('/api/documents')
      .send({ title: 'Shared authorization document' })
      .expect(201);

    documentId = created.body.data.id;
    expect(documentId).toBeDefined();

    await owner
      .post(`/api/documents/${documentId}/share`)
      .send({ email: viewerEmail, permission: 'VIEWER' })
      .expect(201);

    const sharedList = await viewer.get('/api/documents/shared').expect(200);
    expect(sharedList.body.data).toHaveLength(1);
    expect(sharedList.body.data[0]).toMatchObject({
      id: documentId,
      accessType: 'SHARED',
      permission: 'VIEWER',
    });

    const viewerRead = await viewer
      .get(`/api/documents/${documentId}`)
      .expect(200);
    expect(viewerRead.body.data.access.canEdit).toBe(false);
    expect(viewerRead.body.data.content).toBeDefined();

    await viewer
      .patch(`/api/documents/${documentId}`)
      .send({ content })
      .expect(403);

    await viewer
      .post(`/api/documents/${documentId}/share`)
      .send({ email: ownerEmail, permission: 'EDITOR' })
      .expect(403);

    await owner
      .patch(`/api/documents/${documentId}/share/${viewerId}`)
      .send({ permission: 'EDITOR' })
      .expect(200);

    const editorUpdate = await viewer
      .patch(`/api/documents/${documentId}`)
      .send({ content })
      .expect(200);

    expect(editorUpdate.body.data.access.role).toBe('EDITOR');
    expect(editorUpdate.body.data.access.canEdit).toBe(true);

    await viewer.delete(`/api/documents/${documentId}`).expect(403);

    await owner
      .delete(`/api/documents/${documentId}/share/${viewerId}`)
      .expect(200);

    await viewer.get(`/api/documents/${documentId}`).expect(404);
    await viewer.patch(`/api/documents/${documentId}`).send({ content }).expect(404);

    const ownedAfter = await owner.get('/api/documents').expect(200);
    expect(ownedAfter.body.data).toHaveLength(1);
  });
});
