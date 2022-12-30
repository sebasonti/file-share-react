import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFolder } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import { Button } from "react-bootstrap";

export default function Folder({ folder }) {
  return (
    <Button
      to={`/folder/${folder.id}`}
      state={{ folder }}
      variant="outline-dark"
      className="text-truntace w-100"
      as={Link}
    >
      <FontAwesomeIcon icon={faFolder} className="me-2" />
      {folder.name}
    </Button>
  );
}
