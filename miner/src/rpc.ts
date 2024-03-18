import { c } from './mc';
import { log } from './log';
import { dbQueueJob, dbGetJobs, dbDeleteJob } from './db';
import bodyParser from 'body-parser';
import express, { Express, Request, Response, NextFunction } from 'express';

const app: Express = express();
app.use(bodyParser.json());

enum JobMethod {
  QueueJob = 'queueJob',
  GetJobs = 'getJobs',
  DeleteJob = 'deleteJob',
  RunQuery = 'runQuery',
}

// Error handling middleware
const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  log.error(err);
  res.status(500).json({ status: 'error', message: 'Internal Server Error' });
};

app.get('/', (req: Request, res: Response) => {
  res.send('Arbius Miner RPC');
});

app.post('/api/jobs/queue', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { method, priority, waituntil, concurrent, data } = req.body;

    if (!method || typeof method !== 'string') {
      throw new Error('Invalid method');
    }

    if (typeof priority !== 'number') {
      throw new Error('Invalid priority');
    }

    if (typeof waituntil !== 'number') {
      throw new Error('Invalid waituntil');
    }

    if (typeof concurrent !== 'boolean') {
      throw new Error('Invalid concurrent');
    }

    if (!data || typeof data !== 'object') {
      throw new Error('Invalid data');
    }

    await dbQueueJob({ method, priority, waituntil, concurrent, data });
    res.json({ status: 'success' });
  } catch (err) {
    next(err);
  }
});

app.post('/api/jobs/get', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = req.body.limit && typeof req.body.limit === 'number' ? req.body.limit : 100_000;
    const jobs = await dbGetJobs(limit);
    res.json({ status: 'success', jobs });
  } catch (err) {
    next(err);
  }
});

app.post('/api/jobs/delete', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.body.id;

    if (typeof id !== 'number') {
      throw new Error('Invalid job ID');
    }

    await dbDeleteJob(id);
    res.json({ status: 'success' });
  } catch (err) {
    next(err);
  }
});

app.post('/api/db/run', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { method, priority, waituntil, concurrent, data } = req.body;

    if (!Object.values(JobMethod).includes(method)) {
      throw new Error('Invalid job method');
    }

    await dbQueueJob({ method, priority, waituntil, concurrent, data });
    res.json({ status: 'success' });
  } catch (err) {
    next(err);
  }
});

app.use(errorHandler);

export async function initializeRPC(): Promise<void> {
  return new Promise((resolve) => {
    app.listen(c.rpc.port, c.rpc.host, () => {
      log.debug(`RPC server listening on ${c.rpc.host}:${c.rpc.port}`);
      resolve();
    });
  });
}