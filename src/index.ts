import { RequestHandler } from 'express';

export type VersionHandler = {
  version?: string;
  handler: RequestHandler[] | RequestHandler;
  major?: number;
  minor?: number;
  patch?: number;
};

const firstMiddleware: (versionOptions: VersionHandler[]) => RequestHandler = (versionOptions) => (
  req,
  res,
  next
) => {
  let versions: VersionHandler[] = [...versionOptions];

  const acceptVersion: string =
    req.headers && req.headers['accept-version']
      ? (req.headers['accept-version'] as string)
      : 'latest';
  let major = 0;
  let minor = 0;
  let patch = 0;
  let semver = 0;

  if (acceptVersion !== 'latest') {
    const splitted = acceptVersion.split('.');
    semver = acceptVersion[0] === '^' ? 2 : acceptVersion[0] === '~' ? 1 : 0;
    major = Number.parseInt(semver !== 0 ? splitted[0].substring(1) : splitted[0]);
    minor = 0;
    patch = 0;
    if (splitted.length > 1) {
      minor = Number.parseInt(splitted[1]);
    } else if (semver < 2) {
      semver = 2;
    }
    if (splitted.length > 1) {
      patch = Number.parseInt(splitted[2]);
    } else if (semver < 1) {
      semver = 1;
    }
  }

  versions.map((version) => {
    version.major = version.major || 0;
    version.minor = version.minor || 0;
    version.patch = version.patch || 0;
    if (version.version) {
      const splited = version.version.split('.').map((value) => Number.parseInt(value));
      version.major = splited[0];
      version.minor = splited.length > 1 ? splited[1] : 0;
      version.patch = splited.length > 2 ? splited[2] : 0;
    } else {
      version.version = `${version.major}.${version.minor}.${version.patch}`;
    }
  });

  versions = versions.sort((a, b) =>
    a.major === b.major
      ? a.minor === b.minor
        ? a.patch - b.patch
        : a.minor - b.minor
      : a.major - b.major
  );

  let recoveryVersion = '0.0.0';
  let recoveryVersions = versions;

  recoveryVersion = versions.length ? versions[versions.length - 1].version : recoveryVersion;
  if (acceptVersion === 'latest') {
    (req as any).acceptedVersion = recoveryVersion;
    return next();
  }

  versions = versions.filter((version) => version.major <= major);

  recoveryVersion = versions.length ? versions[versions.length - 1].version : recoveryVersion;
  if (semver === 2) {
    (req as any).acceptedVersion = recoveryVersion;
    return next();
  }

  versions = versions.filter((version) => version.minor <= minor || version.major < major);

  recoveryVersion = versions.length ? versions[versions.length - 1].version : recoveryVersion;
  if (semver === 1) {
    (req as any).acceptedVersion = recoveryVersion;
    return next();
  }

  versions = versions.filter(
    (version) => version.patch <= patch || version.minor < minor || version.major < major
  );

  recoveryVersion = versions.length !== 0 ? versions[versions.length - 1].version : recoveryVersion;
  (req as any).acceptedVersion = recoveryVersion;
  return next();
};

const createConditionalHandler = (version: string, handler: RequestHandler) => (req, res, next) => {
  if ((req as any).acceptedVersion === version) {
    return handler(req, res, next);
  }

  return next();
};

export const routesVersioning: (versions: VersionHandler[]) => RequestHandler[] = (versions) => {
  const requestHandlers: RequestHandler[] = [];
  for (let version of versions) {
    if (Array.isArray(version.handler)) {
      for (let requestHandler of version.handler) {
        requestHandlers.push(createConditionalHandler(version.version, requestHandler));
      }
    } else {
      requestHandlers.push(createConditionalHandler(version.version, version.handler));
    }
  }

  return [firstMiddleware(versions), ...requestHandlers];
};
