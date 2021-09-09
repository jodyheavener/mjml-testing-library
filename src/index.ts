import {
  BoundFunction,
  getQueriesForElement,
  prettyDOM,
  prettyFormat,
  queries,
  Queries,
} from '@testing-library/dom';
import { JSDOM } from 'jsdom';
import mjml2html from 'mjml';
import { MJMLJsonObject, MJMLParsingOptions } from 'mjml-core';

const mountedContainers = new Set<HTMLElement>();

type RenderResult<Q extends Queries = typeof queries> = {
  container: HTMLElement;
  baseElement: HTMLElement;
  json: MJMLJsonObject;
  debug: (
    el?: HTMLElement | Array<HTMLElement>,
    maxLength?: number,
    options?: prettyFormat.OptionsReceived
  ) => void;
  asFragment: () => DocumentFragment;
} & {
  [P in keyof Q]: BoundFunction<Q[P]>;
};

interface RenderOptions<Q extends Queries = typeof queries> {
  container?: HTMLElement;
  baseElement?: HTMLElement;
  wrap?: boolean;
  queries?: Q;
  mjmlOptions?: MJMLParsingOptions;
}

export const render = <Q extends Queries = typeof queries>(
  ui: string,
  {
    container,
    baseElement = container,
    wrap = false,
    queries,
    mjmlOptions,
  }: RenderOptions<Q> = {}
): RenderResult<Q> => {
  if (!baseElement) {
    baseElement = document.body;
  }

  if (!container) {
    container = baseElement.appendChild(document.createElement('div'));
  }

  mountedContainers.add(container);

  if (wrap) {
    ui = `
      <mjml>
        <mj-body>${ui}</mj-body>
      </mjml>
    `;
  }

  const { html, json } = mjml2html(ui, mjmlOptions);
  const body = new JSDOM(html).window.document.body;
  container.innerHTML = body.innerHTML;

  return {
    container,
    baseElement,
    json,
    debug: (el = baseElement, maxLength, options) =>
      Array.isArray(el)
        ? el.forEach((e) => console.log(prettyDOM(e, maxLength, options)))
        : console.log(prettyDOM(el, maxLength, options)),
    asFragment: () => {
      if (typeof document.createRange === 'function') {
        return document
          .createRange()
          .createContextualFragment(container!.innerHTML);
      } else {
        const template = document.createElement('template');
        template.innerHTML = container!.innerHTML;
        return template.content;
      }
    },
    ...getQueriesForElement(baseElement, queries),
  };
};

export const cleanup = (): void => {
  mountedContainers.forEach(cleanupAtContainer);
};

const cleanupAtContainer = (container: HTMLElement): void => {
  if (container.parentNode === document.body) {
    document.body.removeChild(container);
  }

  mountedContainers.delete(container);
};

export * from '@testing-library/dom';
