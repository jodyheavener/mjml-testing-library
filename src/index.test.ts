import '@testing-library/jest-dom';
import { JSDOM } from 'jsdom';
import mjml2html from 'mjml';
import { MJMLJsonWithChildren } from 'mjml-core';
import { cleanup, render, screen } from './';

const exampleText = 'This is some text';

const unwrappedTemplate = `
  <mj-section>
    <mj-column>
      <mj-text color="blue" font-size="10px">
        ${exampleText}
      </mj-text>
    </mj-column>
  </mj-section>
`;

const wrappedTemplate = `
  <mjml>
    <mj-body>
      ${unwrappedTemplate}
    </mj-body>
  </mjml>
`;

describe('render', () => {
  afterEach(cleanup);

  it('renders the template into the document', () => {
    const renderedHtml = mjml2html(wrappedTemplate).html;
    const body = new JSDOM(renderedHtml).window.document.body;

    const { container } = render(wrappedTemplate);
    expect(container.innerHTML).toEqual(body.innerHTML);
    expect(container).toBeInTheDocument();
  });

  it('applies MJML configuration', () => {
    // Let's set the validationLevel to strict and then try to
    // parse some invalid MJML; the error should be expected
    expect(() => {
      render(
        `
          <mjml>
            <mj-column>
              <mj-section>
                Invalid syntax
              </mj-section>
            </mj-column>
          </mjml>
        `,
        {
          mjmlOptions: { validationLevel: 'strict' },
        }
      );
    }).toThrow();
  });

  it('returns the template json', () => {
    const renderedJson = mjml2html(wrappedTemplate, {
      actualPath: '/',
    }).json;

    const { json } = render(wrappedTemplate, {
      mjmlOptions: { actualPath: '/' },
    });
    expect(json).toStrictEqual(renderedJson);
    expect(json).toMatchSnapshot();
  });

  describe('wrap', () => {
    it('provides base mjml components when true', () => {
      const { json, container } = render(unwrappedTemplate, {
        wrap: true,
        mjmlOptions: { validationLevel: 'strict' },
      });

      const body = (json as MJMLJsonWithChildren).children[0];
      expect(body.tagName).toEqual('mj-body');
      expect(container).toMatchSnapshot();
    });

    it('allows you to provide your own wrapper', () => {
      const { json, container } = render(unwrappedTemplate, {
        wrap: (content: string) => `
          <mjml>
            <mj-body css-class="hello">
              ${content}
            </mj-body>
          </mjml>
        `,
        mjmlOptions: { validationLevel: 'strict' },
      });

      const body = (json as MJMLJsonWithChildren).children[0];
      expect(body.tagName).toEqual('mj-body');
      expect((body.attributes as Record<string, string>)['css-class']).toEqual(
        'hello'
      );
      expect(container).toMatchSnapshot();
    });
  });

  it('returns baseElement which defaults to document.body', () => {
    const { baseElement } = render(wrappedTemplate);
    expect(baseElement).toBe(document.body);
  });

  it('supports fragments', () => {
    const { asFragment } = render(wrappedTemplate);
    expect(asFragment()).toMatchSnapshot();
  });

  describe('debug', () => {
    beforeEach(() => {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
      (console.log as jest.Mock).mockRestore();
      cleanup();
    });

    it('pretty prints the container', () => {
      const { debug } = render(wrappedTemplate);

      debug();

      expect(console.log).toHaveBeenCalledTimes(1);
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining(exampleText)
      );
    });

    it('pretty prints multiple container', () => {
      const { debug } = render(
        `
          <mjml>
            <mj-body>
              <mj-section>
                <mj-column>
                  <mj-text color="blue" font-size="10px">
                    ${exampleText}
                  </mj-text>
                  <mj-text color="blue" font-size="10px">
                    ${exampleText}
                  </mj-text>
                </mj-column>
              </mj-section>
            </mj-body>
          </mjml>
        `
      );

      const multipleElements = screen.getAllByText(exampleText);
      debug(multipleElements);

      expect(console.log).toHaveBeenCalledTimes(2);
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining(exampleText)
      );
    });
  });
});

describe('cleanup', () => {
  it('cleans up the document', () => {
    render(wrappedTemplate);
    expect(screen.queryByText(exampleText)).toBeInTheDocument();

    cleanup();

    expect(screen.queryByText(exampleText)).not.toBeInTheDocument();
    expect(document.body).toBeEmptyDOMElement();
  });

  it('does not error when an element is not a child', () => {
    render(wrappedTemplate, { container: document.createElement('div') });
    cleanup();
  });
});
