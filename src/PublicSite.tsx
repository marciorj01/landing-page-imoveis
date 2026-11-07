import PageRenderer from "./cms/PageRenderer";
import { DEFAULT_HOME_PAGE_SCHEMA } from "./cms/defaults";

export default function PublicSite() {
  return <PageRenderer schema={DEFAULT_HOME_PAGE_SCHEMA} />;
}
