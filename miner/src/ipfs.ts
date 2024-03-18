import fs from 'fs';
import FormData from 'form-data';
import axios from 'axios';
import { MiningConfig } from './types';
import { create, IPFSHTTPClient } from 'ipfs-http-client';
import { AddOptions } from 'ipfs-core-types/types/src/root';

let ipfsClient: IPFSHTTPClient | undefined;

const ipfsOptions: AddOptions = {
  cidVersion: 0,
  hashAlg: 'sha2-256',
  chunker: 'size-262144',
  rawLeaves: false,
};

function initializeIpfsClient(c: MiningConfig) {
  if (ipfsClient == undefined) {
    ipfsClient = create({
      url: c.ipfs.http_client.url,
    });
  }
}

export async function checkIpfs(c: MiningConfig) {
  switch (c.ipfs.strategy) {
    case 'http_client': {
      initializeIpfsClient(c);
      if (ipfsClient == undefined)
        throw new Error('ipfs client not initialized');
      try {
        for await (const res of ipfsClient.ping(
          'QmcfgsJsMtx6qJb74akCw1M24X1zFwgGo11h1cuhwQjtJP'
        )) {
          if (res.success) {
            break;
          }
        }
        return;
      } catch (e) {
        throw new Error('ipfs client not connected');
      }
    }
    case 'pinata': {
      try {
        const res = await axios.get(
          'https://api.pinata.cloud/data/testAuthentication',
          {
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${c.ipfs.pinata.jwt}`,
            },
          }
        );
        if (res.status === 200) return;
        else throw new Error('pinata authentication failed');
      } catch (e) {
        // AxiosError: Request failed with status code 401
        throw new Error('wrong pinata jwt');
      }
    }
    default:
      throw new Error('unknown ipfs strategy');
  }
}

export async function pinFilesToIPFS(
  c: MiningConfig,
  taskid: string,
  paths: string[]
) {
  switch (c.ipfs.strategy) {
    case 'http_client': {
      initializeIpfsClient(c);
      if (ipfsClient == undefined)
        throw new Error('ipfs client not initialized');

      const data = paths.map((path) => ({
        path,
        content: fs.readFileSync(`${__dirname}/../${c.cache_path}/${path}`),
      }));

      const options = {
        ...ipfsOptions,
        wrapWithDirectory: true,
      };

      const res = ipfsClient.addAll(data, options);
      for await (const { path, cid } of res) {
        if (path === '') {
          return cid.toString();
        }
      }

      throw new Error('ipfs cid extract failed');
    }
    case 'pinata': {
      const formData = new FormData();

      for (let path of paths) {
        formData.append(
          'file',
          fs.createReadStream(`${__dirname}/../${c.cache_path}/${path}`),
          {
            filepath: `${taskid}/${path}`,
          }
        );
      }

      formData.append('pinataOptions', JSON.stringify({ cidVersion: 0 }));

      try {
        const res = await axios.post(
          'https://api.pinata.cloud/pinning/pinFileToIPFS',
          formData,
          {
            maxBodyLength: c.ipfs.pinata?.maxBodyLength || Infinity,
            headers: {
              // @ts-ignore
              'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
              Authorization: `Bearer ${c.ipfs.pinata.jwt}`,
            },
          }
        );
        return res.data.IpfsHash;
      } catch (e) {
        console.error('Error pinning files to Pinata:', e);
        throw e;
      }
    }
    default:
      throw new Error('unknown ipfs strategy');
  }
}

export async function pinFileToIPFS(
  c: MiningConfig,
  content: Buffer,
  filename: string
) {
  switch (c.ipfs.strategy) {
    case 'http_client': {
      initializeIpfsClient(c);
      if (ipfsClient == undefined)
        throw new Error('ipfs client not initialized');

      const { cid } = await ipfsClient.add(content, ipfsOptions);
      return cid.toString();
    }
    case 'pinata': {
      const formData = new FormData();

      formData.append('file', content, filename);
      formData.append('pinataOptions', JSON.stringify({ cidVersion: 0 }));

      try {
        const res = await axios.post(
          'https://api.pinata.cloud/pinning/pinFileToIPFS',
          formData,
          {
            maxBodyLength: c.ipfs.pinata?.maxBodyLength || Infinity,
            headers: {
              // @ts-ignore
              'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
              Authorization: `Bearer ${c.ipfs.pinata.jwt}`,
            },
          }
        );
        return res.data.IpfsHash;
      } catch (e) {
        console.error('Error pinning file to Pinata:', e);
        throw e;
      }
    }
    default:
      throw new Error('unknown ipfs strategy');
  }
}