import { JSDOM } from 'jsdom';
import mjml2html from 'mjml';
import { cleanup, render, screen } from './';

const dummyText = 'This is some text';

const template = `
  <mjml>
    <mj-body>
      <mj-section>
        <mj-column>
          <mj-text color="blue" font-size="10px">
            ${dummyText}
          </mj-text>
        </mj-column>
      </mj-section>
    </mj-body>
  </mjml>
`;

describe('render', () => {
  afterEach(cleanup);

  it('renders the template into the document', () => {
    const renderedHtml = mjml2html(template).html;
    const body = new JSDOM(renderedHtml).window.document.body;

    const { container } = render(template);
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
    const renderedJson = mjml2html(template).json;

    const { json } = render(template);
    expect(json).toStrictEqual(renderedJson);
    expect(json).toMatchSnapshot();
  });

  it('returns baseElement which defaults to document.body', () => {
    const { baseElement } = render(template);
    expect(baseElement).toBe(document.body);
  });

  it('supports fragments', () => {
    const { asFragment } = render(template);
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
      const { debug } = render(template);

      debug();

      expect(console.log).toHaveBeenCalledTimes(1);
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining(dummyText)
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
                    ${dummyText}
                  </mj-text>
                  <mj-text color="blue" font-size="10px">
                    ${dummyText}
                  </mj-text>
                </mj-column>
              </mj-section>
            </mj-body>
          </mjml>
        `
      );

      const multipleElements = screen.getAllByText(dummyText);
      debug(multipleElements);

      expect(console.log).toHaveBeenCalledTimes(2);
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining(dummyText)
      );
    });
  });
});

describe('cleanup', () => {
  it('cleans up the document', () => {
    render(template);
    expect(screen.queryByText(dummyText)).toBeInTheDocument();

    cleanup();

    expect(screen.queryByText(dummyText)).not.toBeInTheDocument();
    expect(document.body).toBeEmptyDOMElement();
  });

  it('does not error when an element is not a child', () => {
    render(template, { container: document.createElement('div') });
    cleanup();
  });
});
