# -*- coding: utf-8; -*-
#
# This file is part of Superdesk.
#
#  Copyright 2021 Sourcefabric z.u. and contributors.
#
# For the full copyright and license information, please see the
# AUTHORS and LICENSE files distributed with this source code, or
# at https://www.sourcefabric.org/superdesk/license

from typing import Set
from superdesk import get_resource_service


def get_planning_schema(resource: str):
    return get_resource_service("planning_types").find_one(req=None, name=resource)


def is_field_enabled(field, planning_type):
    editor = planning_type.get("editor") or {}
    return (editor.get(field) or {}).get("enabled", False)


def is_field_editor_3(field: str, planning_type) -> bool:
    return (
        is_field_enabled(field, planning_type)
        and ((planning_type.get("schema") or {}).get(field) or {}).get("field_type") == "editor_3"
    )


def get_multilingual_fields(resource: str) -> Set[str]:
    content_type = get_planning_schema(resource)
    resource_schema = content_type.get("schema") or {}

    return (
        set()
        if not (resource_schema.get("language") or {}).get("multilingual")
        else set(
            field_name
            for field_name, field_schema in resource_schema.items()
            if (
                is_field_enabled(field_name, content_type)
                and field_name != "language"
                and (field_schema or {}).get("multilingual") is True
            )
        )
    )
