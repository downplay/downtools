import React, { Component } from "react";
import { shallow, mount } from "enzyme";
import withViewport, {
    DEFAULT_BROWSERLESS_WIDTH,
    DEFAULT_BROWSERLESS_HEIGHT
} from "../withViewport";

const JSDOM_DEFAULT_WIDTH = 1024;
const JSDOM_DEFAULT_HEIGHT = 768;

class MockEntity extends Component {
    render() {
        return null;
    }
}

test("Wrapped component is rendered", () => {
    const Wrapped = withViewport()(MockEntity);
    const entity = shallow(<Wrapped />);
    expect(entity.find(MockEntity).length).toBe(1);
});

test("Wrapped component receives window width and height", () => {
    const Wrapped = withViewport()(MockEntity);
    const entity = shallow(<Wrapped />);
    expect(entity.find(MockEntity).node.props.viewportWidth).toBe(
        JSDOM_DEFAULT_WIDTH
    );
    expect(entity.find(MockEntity).node.props.viewportHeight).toBe(
        JSDOM_DEFAULT_HEIGHT
    );
});

const MockSFC = props => null;

test("Wrapped SFC is rendered", () => {
    const Wrapped = withViewport()(MockSFC);
    const entity = shallow(<Wrapped />);
    expect(entity.find(MockSFC).length).toBe(1);
});

test("In rehydrate mode, width and height are defaults", () => {
    const Wrapped = withViewport({ handleRehydration: true })(MockEntity);
    const entity = shallow(<Wrapped />);
    expect(entity.find(MockEntity).node.props.viewportWidth).toBe(
        DEFAULT_BROWSERLESS_WIDTH
    );
    expect(entity.find(MockEntity).node.props.viewportHeight).toBe(
        DEFAULT_BROWSERLESS_HEIGHT
    );
});

test("Default width and height can be overridden", () => {
    const otherWidth = 5678;
    const otherHeight = 1234;
    const Wrapped = withViewport({
        browserlessWidth: otherWidth,
        browserlessHeight: otherHeight,
        handleRehydration: true
    })(MockEntity);
    const entity = shallow(<Wrapped />);
    expect(entity.find(MockEntity).node.props.viewportWidth).toBe(otherWidth);
    expect(entity.find(MockEntity).node.props.viewportHeight).toBe(otherHeight);
});

test("Set isBrowserless in SSR rehydration mode", () => {
    const Wrapped = withViewport({
        handleRehydration: true
    })(MockEntity);
    const entity = shallow(<Wrapped />);
    expect(entity.find(MockEntity).node.props.isBrowserless).toBe(true);
});

test("Cannot override width and height if not rehydrating", () => {
    const otherWidth = 5678;
    const otherHeight = 1234;
    const Wrapped = withViewport({
        browserlessWidth: otherWidth,
        browserlessHeight: otherHeight,
        handleRehydration: false
    })(MockEntity);
    const entity = shallow(<Wrapped />);
    expect(entity.find(MockEntity).node.props.viewportWidth).toBe(
        JSDOM_DEFAULT_WIDTH
    );
    expect(entity.find(MockEntity).node.props.viewportHeight).toBe(
        JSDOM_DEFAULT_HEIGHT
    );
});

test("In rehydrate mode, width and height eventually take window values", done => {
    const Wrapped = withViewport({ handleRehydration: true })(MockEntity);
    const entity = mount(<Wrapped />);
    expect(entity.find(MockEntity).node.props.viewportWidth).toBe(
        DEFAULT_BROWSERLESS_WIDTH
    );
    expect(entity.find(MockEntity).node.props.viewportHeight).toBe(
        DEFAULT_BROWSERLESS_HEIGHT
    );
    setImmediate(() => {
        expect(entity.find(MockEntity).node.props.viewportWidth).toBe(
            JSDOM_DEFAULT_WIDTH
        );
        expect(entity.find(MockEntity).node.props.viewportHeight).toBe(
            JSDOM_DEFAULT_HEIGHT
        );
        done();
    });
});

test("In rehydrate mode, width and height eventually take overidden values", done => {
    const otherWidth = 5678;
    const otherHeight = 1234;
    const Wrapped = withViewport({
        browserlessWidth: otherWidth,
        browserlessHeight: otherHeight,
        handleRehydration: false
    })(MockEntity);
    const entity = mount(<Wrapped />);
    expect(entity.find(MockEntity).node.props.viewportWidth).toBe(
        DEFAULT_BROWSERLESS_WIDTH
    );
    expect(entity.find(MockEntity).node.props.viewportHeight).toBe(
        DEFAULT_BROWSERLESS_HEIGHT
    );
    setImmediate(() => {
        expect(entity.find(MockEntity).node.props.viewportWidth).toBe(
            otherWidth
        );
        expect(entity.find(MockEntity).node.props.viewportHeight).toBe(
            otherHeight
        );
        done();
    });
});

test("Browser resize updates the viewport", done => {
    const otherWidth = 5678;
    const otherHeight = 1234;
    const Wrapped = withViewport()(MockEntity);
    const entity = mount(<Wrapped />);
    window.innerWidth = otherWidth;
    window.innerHeight = otherHeight;
    window.dispatchEvent(new Event("resize"));
    setImmediate(() => {
        expect(entity.find(MockEntity).node.props.viewportWidth).toBe(
            otherWidth
        );
        expect(entity.find(MockEntity).node.props.viewportHeight).toBe(
            otherHeight
        );
        done();
    });
});
