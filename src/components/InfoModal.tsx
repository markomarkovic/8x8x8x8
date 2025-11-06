type InfoModalProps = {
  onClose: () => void
}

export function InfoModal({ onClose }: InfoModalProps) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal info-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>How to Use 8x8x8x8</h3>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body">
          <section>
            <h4>Drawing</h4>
            <ul>
              <li>Click on the 8×8 grid to draw pixels</li>
              <li>Select colors from the palette on the right</li>
              <li>
                Double-click any palette color to customize it with a color
                picker
              </li>
            </ul>
          </section>

          <section>
            <h4>Animation</h4>
            <ul>
              <li>Use the 8 frame selector below the grid to switch frames</li>
              <li>
                Watch your animation preview in the small canvas on the right
              </li>
              <li>Each frame runs at 8 FPS (125ms per frame)</li>
            </ul>
          </section>

          <section>
            <h4>Copy / Paste Frames</h4>
            <ul>
              <li>
                Press <strong>Ctrl+C</strong> (or <strong>Cmd+C</strong> on Mac)
                to copy the current frame
              </li>
              <li>
                Select a different frame and press <strong>Ctrl+V</strong> (or{' '}
                <strong>Cmd+V</strong> on Mac) to paste
              </li>
              <li>Duplicate frames or create variations easily</li>
            </ul>
          </section>

          <section>
            <h4>Undo / Redo</h4>
            <ul>
              <li>
                Use browser <strong>back button</strong> to undo changes
              </li>
              <li>
                Use browser <strong>forward button</strong> to redo changes
              </li>
              <li>Every change is saved in the browser history via the URL</li>
            </ul>
          </section>

          <section>
            <h4>Sharing</h4>
            <ul>
              <li>
                Your animation is automatically saved in the URL as you draw
              </li>
              <li>Share the URL to share your animation</li>
              <li>Open any shared URL to load that animation</li>
            </ul>
          </section>

          <section>
            <h4>Submission & Gallery</h4>
            <ul>
              <li>Sign in with Google to submit your animations</li>
              <li>
                Click "Submit" to add your animation to the approval queue
              </li>
              <li>You can have up to 8 pending submissions at a time</li>
              <li>
                Once approved by an admin, your animation appears in the public
                gallery
              </li>
              <li>Click any gallery animation to view and remix it</li>
            </ul>
          </section>

          <section>
            <h4>Admin Features</h4>
            <ul>
              <li>Admins can review pending submissions</li>
              <li>Click any pending submission to approve or reject it</li>
              <li>Approved animations are added to the public gallery</li>
            </ul>
          </section>

          <section>
            <h4>Source Code</h4>
            <ul>
              <li>
                <a
                  href="https://github.com/markomarkovic/8x8x8x8"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src="https://img.shields.io/badge/View%20on-GitHub-181717?style=for-the-badge&logo=github&logoColor=white"
                    alt="View on GitHub"
                  />
                </a>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  )
}
