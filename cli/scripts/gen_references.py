#!/usr/bin/env python3
"""
gen_references.py - 项目结构扫描器

扫描项目模块结构，输出 JSON 中间数据供 AI 生成完整参考文档。
不依赖任何特定语言或框架的源码解析——语义理解由 AI 完成。

用法:
    python gen_references.py                  # 全量扫描
    python gen_references.py --module libcore # 单模块扫描
    python gen_references.py --output scan.json  # 指定输出文件
    python gen_references.py --refresh        # 仅刷新已有文档对应的扫描数据
    python gen_references.py --diff           # 增量模式：对比上次扫描，输出变更列表
    python gen_references.py --lightweight    # 轻量模式：跳过文件列表/目录树/资源（配合 CodeGraph 使用）
"""

import argparse
import json
import os
import re
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional


# These will be set in main() based on CLI arguments
PROJECT_ROOT: Path = Path.cwd()
REFERENCES_DIR: Path = Path.cwd() / "references"
SCAN_OUTPUT: Path = Path.cwd() / "references" / "_scan.json"
MAX_DEPTH: int = 4


def _detect_output_dir(project_root: Path) -> Path:
    """自动检测输出目录：检查 .qoder/.claude/.codex/.opencode 是否存在"""
    for dirname in [".qoder", ".claude", ".codex", ".opencode"]:
        candidate = project_root / dirname
        if candidate.exists():
            return candidate / "references"
    # 默认使用当前目录下的 references/
    return project_root / "references"

SOURCE_EXTENSIONS = {
    ".kt", ".java", ".swift", ".m", ".h", ".dart", ".ts", ".tsx",
    ".js", ".jsx", ".py", ".go", ".rs", ".cpp", ".c", ".cs",
    ".vue", ".svelte",
}

RESOURCE_EXTENSIONS = {
    ".xml", ".json", ".yaml", ".yml", ".properties", ".plist",
    ".xib", ".storyboard",
}

ASSET_EXTENSIONS = {
    ".png", ".jpg", ".jpeg", ".svg", ".webp", ".gif", ".ico",
    ".ttf", ".otf", ".woff", ".woff2",
}


# === 项目检测 ===

def detect_project_type() -> dict:
    """检测项目类型和构建系统"""
    indicators = [
        ("settings.gradle",      {"platform": "Android", "build": "Gradle"}),
        ("settings.gradle.kts",  {"platform": "Android", "build": "Gradle Kotlin DSL"}),
        ("build.gradle",         {"platform": "JVM", "build": "Gradle"}),
        ("build.gradle.kts",     {"platform": "JVM", "build": "Gradle Kotlin DSL"}),
        ("pom.xml",              {"platform": "JVM", "build": "Maven"}),
        ("hvigor-config.json5",  {"platform": "HarmonyOS", "build": "Hvigor"}),
        ("Package.swift",        {"platform": "iOS", "build": "SPM"}),
        ("Podfile",              {"platform": "iOS", "build": "CocoaPods"}),
        ("pubspec.yaml",         {"platform": "Flutter", "build": "Dart Pub"}),
        ("package.json",         {"platform": "Node", "build": "npm/yarn"}),
        ("Cargo.toml",           {"platform": "Rust", "build": "Cargo"}),
        ("go.mod",               {"platform": "Go", "build": "Go Modules"}),
        ("pyproject.toml",       {"platform": "Python", "build": "Python"}),
    ]
    for filename, info in indicators:
        if (PROJECT_ROOT / filename).exists():
            return info

    # npm/yarn 进一步区分
    pkg_json = PROJECT_ROOT / "package.json"
    if pkg_json.exists():
        try:
            data = json.loads(pkg_json.read_text(encoding="utf-8"))
            deps = {**data.get("dependencies", {}), **data.get("devDependencies", {})}
            if "react-native" in deps:
                return {"platform": "React Native", "build": "npm/yarn"}
            if "next" in deps:
                return {"platform": "Next.js", "build": "npm/yarn"}
        except json.JSONDecodeError:
            pass

    return {"platform": "Unknown", "build": "Unknown"}


# === 模块发现 ===

def discover_modules(lightweight: bool = False) -> List[dict]:
    """自动发现项目模块（适配多种构建系统）"""
    # Gradle
    sg = PROJECT_ROOT / "settings.gradle"
    sg_kts = PROJECT_ROOT / "settings.gradle.kts"
    if sg.exists():
        return _parse_gradle_modules(sg, lightweight=lightweight)
    if sg_kts.exists():
        return _parse_gradle_modules(sg_kts, lightweight=lightweight)

    # Maven
    pom = PROJECT_ROOT / "pom.xml"
    if pom.exists():
        return _parse_maven_modules(pom, lightweight=lightweight)

    # npm/yarn workspaces
    pkg_json = PROJECT_ROOT / "package.json"
    if pkg_json.exists():
        try:
            data = json.loads(pkg_json.read_text(encoding="utf-8"))
            workspaces = data.get("workspaces", [])
            if workspaces:
                return _parse_npm_workspaces(workspaces, lightweight=lightweight)
        except json.JSONDecodeError:
            pass

    # Cargo workspace
    cargo = PROJECT_ROOT / "Cargo.toml"
    if cargo.exists():
        return _parse_cargo_workspace(cargo, lightweight=lightweight)

    # Go
    go_mod = PROJECT_ROOT / "go.mod"
    if go_mod.exists():
        return [_scan_module_dir(PROJECT_ROOT, "root", lightweight=lightweight)]

    # 单模块项目
    return [_scan_module_dir(PROJECT_ROOT, "root", lightweight=lightweight)]


def _parse_gradle_modules(settings_path: Path, lightweight: bool = False) -> List[dict]:
    """解析 settings.gradle 提取模块"""
    modules = []
    content = settings_path.read_text(encoding="utf-8", errors="ignore")
    # 支持 include ':module', include 'module', includeFlat 'module' 格式
    # 同时支持单引号和双引号
    pattern = re.compile(r"^\s*(?:include|includeFlat)\s*['\"][:']?([^'\"]+)['\"]"  , re.MULTILINE)
    for match in pattern.finditer(content):
        line_start = content.rfind("\n", 0, match.start()) + 1
        line = content[line_start:match.start()]
        if "//" in line:
            continue
        raw = match.group(1).lstrip(":")
        is_aar = "libaar" in raw
        name = raw.replace(":", "_").replace("/", "_")
        module_path = PROJECT_ROOT / raw.replace(":", os.sep)
        modules.append(_scan_module_dir(module_path, name, is_aar=is_aar, lightweight=lightweight))
    return modules


def _parse_maven_modules(pom_path: Path, lightweight: bool = False) -> List[dict]:
    """解析 pom.xml 的 <modules>"""
    modules = []
    content = pom_path.read_text(encoding="utf-8", errors="ignore")
    for m in re.finditer(r"<module>([^<]+)</module>", content):
        name = m.group(1).strip()
        module_path = PROJECT_ROOT / name
        modules.append(_scan_module_dir(module_path, name, lightweight=lightweight))
    return modules


def _parse_npm_workspaces(workspaces: Any, lightweight: bool = False) -> List[dict]:
    """解析 npm/yarn workspaces"""
    modules = []
    if isinstance(workspaces, list):
        patterns = workspaces
    elif isinstance(workspaces, dict):
        patterns = workspaces.get("packages", [])
    else:
        return [_scan_module_dir(PROJECT_ROOT, "root", lightweight=lightweight)]

    for pattern in patterns:
        for module_path in sorted(PROJECT_ROOT.glob(pattern)):
            if module_path.is_dir() and (module_path / "package.json").exists():
                name = module_path.name
                modules.append(_scan_module_dir(module_path, name, lightweight=lightweight))
    return modules


def _parse_cargo_workspace(cargo_path: Path, lightweight: bool = False) -> List[dict]:
    """解析 Cargo.toml workspace"""
    modules = []
    content = cargo_path.read_text(encoding="utf-8", errors="ignore")
    for m in re.finditer(r'member\s*=\s*\[([^\]]+)\]', content):
        for member in re.findall(r'"([^"]+)"', m.group(1)):
            module_path = PROJECT_ROOT / member
            if module_path.exists():
                modules.append(_scan_module_dir(module_path, member.replace("/", "_"), lightweight=lightweight))
    return modules if modules else [_scan_module_dir(PROJECT_ROOT, "root", lightweight=lightweight)]


# === 模块扫描 ===

def _scan_module_dir(module_path: Path, name: str, is_aar: bool = False, lightweight: bool = False) -> dict:
    """扫描一个模块目录的结构信息"""
    info = {
        "name": name,
        "path": str(module_path.relative_to(PROJECT_ROOT)) if _is_relative(module_path) else str(module_path),
        "is_aar": is_aar,
        "is_application": False,
        "has_source": False,
        "source_dirs": [],
        "file_count": 0,
        "file_list": [],
        "resource_dirs": [],
        "asset_files": [],
        "tree": "",
        "dependencies": [],
        "build_config": {},
    }

    if is_aar or not module_path.exists():
        return info

    if lightweight:
        # 轻量模式：只保留模块元数据和构建配置，跳过文件列表/目录树/资源
        info["build_config"] = _parse_build_config(module_path)
        info["dependencies"] = info["build_config"].get("dependencies", [])
        info["is_application"] = info["build_config"].get("plugin_type") == "application"
        return info

    # 发现源码根目录
    src_roots = _find_source_roots(module_path)
    for src_root in src_roots:
        src_info = _scan_source_dir(src_root)
        info["source_dirs"].append(src_info)
        info["file_count"] += src_info["file_count"]
        info["file_list"].extend(src_info["file_list"])

    info["has_source"] = info["file_count"] > 0

    # 目录树
    if src_roots:
        tree_lines = []
        for src_root in src_roots:
            rel = src_root.relative_to(PROJECT_ROOT) if _is_relative(src_root) else src_root
            tree_lines.append(f"{rel}/")
            _build_tree(src_root, "", MAX_DEPTH, 0, tree_lines)
        info["tree"] = "\n".join(tree_lines)

    # 资源目录
    res_dir = module_path / "src" / "main" / "res"
    if res_dir.exists():
        info["resource_dirs"] = _scan_resource_dir(res_dir)

    # Assets
    assets_dir = module_path / "src" / "main" / "assets"
    if assets_dir.exists():
        info["asset_files"] = _scan_assets_dir(assets_dir)

    # 构建配置
    info["build_config"] = _parse_build_config(module_path)
    info["dependencies"] = info["build_config"].get("dependencies", [])
    info["is_application"] = info["build_config"].get("plugin_type") == "application"

    return info


def _is_relative(path: Path) -> bool:
    """安全检查路径是否在项目根目录下"""
    try:
        path.relative_to(PROJECT_ROOT)
        return True
    except ValueError:
        return False


def _find_source_roots(module_path: Path) -> List[Path]:
    """发现模块的所有源码根目录"""
    roots = []

    # Android/Gradle 标准: src/main/java, src/main/kotlin
    for variant in ["src/main/java", "src/main/kotlin"]:
        candidate = module_path / variant
        if candidate.exists() and any(candidate.rglob("*")):
            roots.append(candidate)

    # src/main 但排除 java/kotlin（已有）
    src_main = module_path / "src" / "main"
    if src_main.exists() and not roots:
        # 检查是否有其他语言的源码
        has_code = any(
            f.is_file() and f.suffix in SOURCE_EXTENSIONS
            for f in src_main.rglob("*")
        )
        if has_code:
            roots.append(src_main)

    # iOS: 同级 *.xcodeproj
    for proj in module_path.glob("*.xcodeproj"):
        roots.append(module_path)
        break

    # Flutter: lib/
    lib_dir = module_path / "lib"
    if (module_path / "pubspec.yaml").exists() and lib_dir.exists():
        roots.append(lib_dir)

    # Rust: src/
    rust_src = module_path / "src"
    if (module_path / "Cargo.toml").exists() and rust_src.exists():
        roots.append(rust_src)

    # Go: 整个模块
    if (module_path / "go.mod").exists():
        roots.append(module_path)

    # Python
    if (module_path / "pyproject.toml").exists() or (module_path / "setup.py").exists():
        roots.append(module_path)

    # Node/TS: src/
    if (module_path / "package.json").exists():
        for candidate in ["src", "lib", "app"]:
            d = module_path / candidate
            if d.exists():
                roots.append(d)
                break

    # HarmonyOS: src/main/ets/
    ets_dir = module_path / "src" / "main" / "ets"
    if ets_dir.exists():
        roots.append(ets_dir)

    # 兜底: src/
    if not roots:
        src = module_path / "src"
        if src.exists():
            roots.append(src)

    return roots


def _scan_source_dir(src_root: Path) -> dict:
    """扫描源码目录"""
    source_files = []
    for f in src_root.rglob("*"):
        if f.is_file() and f.suffix in SOURCE_EXTENSIONS:
            source_files.append(str(f.relative_to(src_root)))

    # 发现顶层包
    top_packages = set()
    for f in source_files:
        parts = Path(f).parent.parts
        if len(parts) >= 3:
            top_packages.add(".".join(parts[:3]))
        elif len(parts) >= 1:
            top_packages.add(parts[0])

    # 合并公共前缀
    sorted_pkgs = sorted(top_packages)
    merged = []
    for pkg in sorted_pkgs:
        if not merged or not pkg.startswith(merged[-1] + "."):
            merged.append(pkg)

    return {
        "root": str(src_root.relative_to(PROJECT_ROOT)) if _is_relative(src_root) else str(src_root),
        "file_count": len(source_files),
        "file_list": sorted(source_files),
        "top_packages": merged,
    }


def _build_tree(path: Path, prefix: str, max_depth: int, depth: int, lines: List[str]):
    """构建目录树"""
    if depth >= max_depth:
        return
    try:
        entries = sorted(path.iterdir(), key=lambda p: (not p.is_dir(), p.name))
    except (PermissionError, OSError):
        return

    dirs = [e for e in entries if e.is_dir() and not e.name.startswith(".")]
    files = [e for e in entries if e.is_file() and e.suffix in SOURCE_EXTENSIONS]

    items = dirs + files
    for i, item in enumerate(items):
        is_last = i == len(items) - 1
        connector = "└── " if is_last else "├── "
        if item.is_dir():
            fc = sum(1 for _ in item.rglob("*") if _.is_file() and _.suffix in SOURCE_EXTENSIONS)
            lines.append(f"{prefix}{connector}{item.name}/  ({fc}个文件)")
            _build_tree(item, prefix + ("    " if is_last else "│   "), max_depth, depth + 1, lines)
        else:
            lines.append(f"{prefix}{connector}{item.name}")


def _scan_resource_dir(res_dir: Path) -> list:
    """扫描资源目录"""
    result = []
    for item in sorted(res_dir.iterdir()):
        if item.is_dir():
            files = [f.name for f in item.iterdir() if f.is_file()]
            result.append({"dir": item.name, "count": len(files), "files": sorted(files)})
    return result


def _scan_assets_dir(assets_dir: Path) -> list:
    """扫描 assets 目录"""
    result = []
    for f in sorted(assets_dir.rglob("*")):
        if f.is_file():
            result.append(str(f.relative_to(assets_dir)))
    return result


def _parse_build_config(module_path: Path) -> dict:
    """提取构建配置信息"""
    config: Dict[str, Any] = {"dependencies": [], "plugin_type": "library"}

    # Gradle
    gradle_file = None
    for candidate in ["build.gradle", "build.gradle.kts"]:
        g = module_path / candidate
        if g.exists():
            gradle_file = g
            break
    if gradle_file:
        content = gradle_file.read_text(encoding="utf-8", errors="ignore")
        if "com.android.application" in content:
            config["plugin_type"] = "application"
        for m in re.finditer(
            r"(implementation|api|compileOnly|runtimeOnly)\s+project\(\s*['\"][:']?([^'\"]+)['\"]", content
        ):
            config["dependencies"].append({"name": m.group(2).lstrip(":"), "type": m.group(1)})

        # 外部关键依赖
        for m in re.finditer(
            r"(implementation|api)\s+['\"]([^'\"]+:[^'\"]+:[^'\"]+)['\"]", content
        ):
            config["dependencies"].append({"name": m.group(2), "type": m.group(1), "external": True})

        # ViewBinding
        config["view_binding"] = "viewBinding" in content and "true" in content[
            content.find("viewBinding"):content.find("viewBinding") + 50
        ] if "viewBinding" in content else False

        # resourcePrefix
        rp = re.search(r'resourcePrefix\s+["\']([^"\']+)["\']', content)
        if rp:
            config["resource_prefix"] = rp.group(1)

    # package.json
    pkg_json = module_path / "package.json"
    if pkg_json.exists():
        try:
            data = json.loads(pkg_json.read_text(encoding="utf-8"))
            if "main" in data or "bin" in data:
                config["plugin_type"] = "application"
            for dep_type in ["dependencies", "devDependencies", "peerDependencies"]:
                for dep_name, ver in data.get(dep_type, {}).items():
                    config["dependencies"].append({
                        "name": dep_name, "version": ver, "type": dep_type, "external": True
                    })
        except json.JSONDecodeError:
            pass

    # Cargo.toml
    cargo = module_path / "Cargo.toml"
    if cargo.exists():
        content = cargo.read_text(encoding="utf-8", errors="ignore")
        for m in re.finditer(r'(\w+)\s*=\s*"([^"]+)"', content):
            config["dependencies"].append({
                "name": m.group(1), "version": m.group(2), "external": True
            })

    # go.mod
    go_mod = module_path / "go.mod"
    if go_mod.exists():
        content = go_mod.read_text(encoding="utf-8", errors="ignore")
        for m in re.finditer(r'^\s+(\S+)\s+(v\S+)', content, re.MULTILINE):
            config["dependencies"].append({
                "name": m.group(1), "version": m.group(2), "external": True
            })

    return config


# === Diff 工具函数 ===

def _normalize_dep(dep):
    """标准化依赖项用于比较（忽略 type 和 external 标记，只看 name）"""
    if isinstance(dep, dict):
        return dep.get("name", str(dep))
    return str(dep)


def _diff_file_lists(old_files, new_files):
    """比较两个文件列表，返回 added / removed（检测同目录重命名）"""
    old_set = set(old_files)
    new_set = set(new_files)

    raw_added = sorted(new_set - old_set)
    raw_removed = sorted(old_set - new_set)

    # 同目录重命名检测：{parent_dir}/{stem} 相同但后缀/大小写不同
    added = list(raw_added)
    removed = []
    for r in raw_removed:
        r_parent = str(Path(r).parent)
        r_stem = Path(r).stem.lower()
        match_idx = None
        for i, a in enumerate(added):
            a_parent = str(Path(a).parent)
            a_stem = Path(a).stem.lower()
            if r_parent == a_parent and r_stem == a_stem:
                match_idx = i
                break
        if match_idx is not None:
            added.pop(match_idx)  # 已匹配为重命名，不计入 added
        else:
            removed.append(r)

    return added, removed


def _diff_module_files(old_mod, new_mod):
    """比较单个模块的文件变更"""
    old_files = set(old_mod.get("file_list", []))
    new_files = set(new_mod.get("file_list", []))

    if old_files == new_files:
        return None  # 文件无变更

    added, removed = _diff_file_lists(
        old_mod.get("file_list", []),
        new_mod.get("file_list", [])
    )
    return {
        "total_old": len(old_files),
        "total_new": len(new_files),
        "added": added,
        "removed": removed,
    }


def _diff_dependencies(old_deps, new_deps):
    """比较依赖列表"""
    old_names = sorted(_normalize_dep(d) for d in old_deps)
    new_names = sorted(_normalize_dep(d) for d in new_deps)

    added = [d for d in new_names if d not in old_names]
    removed = [d for d in old_names if d not in new_names]

    if not added and not removed:
        return None
    return {"added": added, "removed": removed}


def _detect_renames(old_modules, new_modules):
    """检测模块级别的重命名（基于文件相似度）"""
    renames = []
    old_by_name = {m["name"]: m for m in old_modules}
    new_by_name = {m["name"]: m for m in new_modules}

    removed_names = set(old_by_name.keys()) - set(new_by_name.keys())
    added_names = set(new_by_name.keys()) - set(old_by_name.keys())

    matched_old = set()
    matched_new = set()

    for old_name in removed_names:
        old_files = set(old_by_name[old_name].get("file_list", []))
        if not old_files:
            continue
        best_match = None
        best_ratio = 0
        for new_name in added_names:
            if new_name in matched_new:
                continue
            new_files = set(new_by_name[new_name].get("file_list", []))
            if not new_files:
                continue
            common = len(old_files & new_files)
            ratio = common / max(len(old_files), len(new_files))
            if ratio > 0.5 and ratio > best_ratio:
                best_ratio = ratio
                best_match = new_name
        if best_match:
            renames.append({"from": old_name, "to": best_match, "similarity": round(best_ratio, 2)})
            matched_old.add(old_name)
            matched_new.add(best_match)

    return renames, matched_old, matched_new


def _diff_scans(old_scan, new_scan):
    """完整对比两次扫描结果"""
    old_modules = {m["name"]: m for m in old_scan.get("modules", [])}
    new_modules = {m["name"]: m for m in new_scan.get("modules", [])}

    old_names = set(old_modules.keys())
    new_names = set(new_modules.keys())

    # 模块级重命名检测
    renames, renamed_old, renamed_new = _detect_renames(
        old_scan.get("modules", []),
        new_scan.get("modules", [])
    )

    modules_added = sorted(new_names - old_names - renamed_new)
    modules_removed = sorted(old_names - new_names - renamed_old)
    modules_common = sorted(old_names & new_names)

    modules_detail = {}

    # 新增模块
    for name in modules_added:
        m = new_modules[name]
        modules_detail[name] = {
            "status": "added",
            "file_count": m["file_count"],
            "has_source": m["has_source"],
        }

    # 删除模块
    for name in modules_removed:
        m = old_modules[name]
        modules_detail[name] = {
            "status": "removed",
            "file_count": m["file_count"],
        }

    # 重命名模块
    for rename in renames:
        modules_detail[rename["from"]] = {
            "status": "renamed",
            "new_name": rename["to"],
            "similarity": rename["similarity"],
        }
        # 新名字也标记，方便 AI 查找
        modules_detail[rename["to"]] = {
            "status": "renamed_from",
            "old_name": rename["from"],
            "similarity": rename["similarity"],
        }

    # 公共模块：逐个检查文件和依赖变更
    for name in modules_common:
        old_m = old_modules[name]
        new_m = new_modules[name]
        changes = {}

        file_diff = _diff_module_files(old_m, new_m)
        if file_diff:
            changes["files"] = file_diff

        dep_diff = _diff_dependencies(
            old_m.get("dependencies", []),
            new_m.get("dependencies", [])
        )
        if dep_diff:
            changes["dependencies"] = dep_diff

        if changes:
            modules_detail[name] = {"status": "changed", **changes}

    return {
        "diff_version": "1.0",
        "old_scan_time": old_scan.get("scan_time", "unknown"),
        "new_scan_time": new_scan.get("scan_time", "unknown"),
        "project_type": new_scan.get("project_type", {}),
        "summary": {
            "modules_added": len(modules_added),
            "modules_removed": len(modules_removed),
            "modules_renamed": len(renames),
            "modules_changed": sum(
                1 for v in modules_detail.values()
                if v.get("status") == "changed"
            ),
            "modules_unchanged": len(modules_common) - sum(
                1 for v in modules_detail.values()
                if v.get("status") == "changed"
            ),
        },
        "modules": modules_detail,
    }


def _build_diff_summary(diff_result):
    """生成人类可读的 diff 摘要"""
    s = diff_result["summary"]
    lines = [
        "增量扫描 Diff 报告",
        f"  模块: +{s['modules_added']} 新增, -{s['modules_removed']} 删除, "
        f"~{s['modules_renamed']} 重命名, Δ{s['modules_changed']} 变更, "
        f"={s['modules_unchanged']} 未变",
    ]

    for name, detail in sorted(diff_result["modules"].items()):
        status = detail["status"]
        if status == "added":
            lines.append(f"  [+] {name} ({detail['file_count']} 文件)")
        elif status == "removed":
            lines.append(f"  [-] {name} ({detail['file_count']} 文件)")
        elif status == "renamed":
            lines.append(f"  [~] {detail['new_name']} ← {name} (相似度 {detail['similarity']:.0%})")
        elif status == "changed":
            parts = []
            if "files" in detail:
                f = detail["files"]
                parts.append(f"文件 +{len(f['added'])}/-{len(f['removed'])}")
            if "dependencies" in detail:
                d = detail["dependencies"]
                parts.append(f"依赖 +{len(d['added'])}/-{len(d['removed'])}")
            lines.append(f"  [Δ] {name}: {', '.join(parts)}")

    needs_refresh = []
    for name, detail in diff_result["modules"].items():
        if detail["status"] in ("added", "removed", "renamed", "renamed_from"):
            needs_refresh.append(name)
        elif detail["status"] == "changed":
            if "dependencies" in detail:
                needs_refresh.append(name)

    lines.append("")
    if needs_refresh:
        lines.append(f"需要重新生成文档的模块: {', '.join(sorted(set(needs_refresh)))}")
    else:
        files_only = [
            name for name, detail in diff_result["modules"].items()
            if detail["status"] == "changed" and "files" in detail
        ]
        if files_only:
            lines.append(f"仅文件变更（可增量更新）: {', '.join(sorted(files_only))}")
        else:
            lines.append("无变更，references 无需更新")

    return "\n".join(lines)


# === 主流程 ===

def main():
    global PROJECT_ROOT, REFERENCES_DIR, SCAN_OUTPUT, MAX_DEPTH

    parser = argparse.ArgumentParser(description="项目结构扫描器 - 输出 JSON 供 AI 生成完整参考文档")
    parser.add_argument("--module", type=str, help="仅扫描指定模块")
    parser.add_argument("--output", type=str, help="输出文件路径（默认 <output-dir>/_scan.json）")
    parser.add_argument("--refresh", action="store_true", help="仅刷新已有文档对应的模块")
    parser.add_argument("--diff", action="store_true",
                        help="增量模式：对比当前项目结构与上次扫描结果，输出变更列表")
    parser.add_argument("--project-root", type=str, default=None,
                        help="项目根目录（默认为当前工作目录）")
    parser.add_argument("--output-dir", type=str, default=None,
                        help="输出目录（默认自动检测 .qoder/.claude/.codex/.opencode，否则使用 references/）")
    parser.add_argument("--max-depth", type=int, default=4,
                        help="目录树最大深度（默认 4）")
    parser.add_argument("--lightweight", action="store_true",
                        help="轻量模式：跳过文件列表、目录树、资源/资产扫描（配合 CodeGraph 使用）")
    args = parser.parse_args()

    # 设置 PROJECT_ROOT
    PROJECT_ROOT = Path(args.project_root).resolve() if args.project_root else Path.cwd()

    # 设置 REFERENCES_DIR
    if args.output_dir:
        REFERENCES_DIR = Path(args.output_dir).resolve()
    else:
        REFERENCES_DIR = _detect_output_dir(PROJECT_ROOT)

    SCAN_OUTPUT = REFERENCES_DIR / "_scan.json"
    MAX_DEPTH = args.max_depth

    REFERENCES_DIR.mkdir(parents=True, exist_ok=True)

    if args.diff:
        # === 增量 Diff 模式 ===
        if not SCAN_OUTPUT.exists():
            print("首次运行，无历史扫描数据，将执行全量扫描...")
            args.diff = False  # fall through to full scan
        else:
            print("加载上次扫描数据...")
            old_scan = json.loads(SCAN_OUTPUT.read_text(encoding="utf-8"))

            print("扫描当前项目结构...")
            project_type = detect_project_type()
            modules = discover_modules(lightweight=args.lightweight)

            if args.module:
                modules = [m for m in modules if m["name"] == args.module]
                if not modules:
                    print(f"错误: 未找到模块 '{args.module}'")
                    sys.exit(1)

            new_scan = {
                "project_root": str(PROJECT_ROOT),
                "project_type": project_type,
                "scan_time": _current_time(),
                "module_count": len(modules),
                "modules": modules,
            }

            # 对比
            diff_result = _diff_scans(old_scan, new_scan)

            # 输出 diff
            output_path = Path(args.output) if args.output else REFERENCES_DIR / "_diff.json"
            output_path.parent.mkdir(parents=True, exist_ok=True)
            output_path.write_text(
                json.dumps(diff_result, ensure_ascii=False, indent=2),
                encoding="utf-8"
            )

            # 同时更新 _scan.json 为最新
            SCAN_OUTPUT.write_text(
                json.dumps(new_scan, ensure_ascii=False, indent=2),
                encoding="utf-8"
            )

            # 打印摘要
            print(_build_diff_summary(diff_result))
            print(f"\nDiff 输出: {output_path}")
            print(f"扫描数据已更新: {SCAN_OUTPUT}")

            # 退出，不走下面的全量逻辑
            return

    # === 全量扫描模式（默认 / --refresh 降级） ===
    print("扫描项目结构...")
    project_type = detect_project_type()
    modules = discover_modules(lightweight=args.lightweight)

    if args.module:
        modules = [m for m in modules if m["name"] == args.module]
        if not modules:
            print(f"错误: 未找到模块 '{args.module}'")
            sys.exit(1)

    if args.refresh:
        existing = {f.stem for f in REFERENCES_DIR.glob("*.md") if not f.stem.startswith("_")}
        modules = [m for m in modules if m["name"] in existing]

    scan_result = {
        "project_root": str(PROJECT_ROOT),
        "project_type": project_type,
        "scan_time": _current_time(),
        "module_count": len(modules),
        "modules": modules,
    }

    output_path = Path(args.output) if args.output else SCAN_OUTPUT
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(scan_result, ensure_ascii=False, indent=2), encoding="utf-8")

    total_files = sum(m["file_count"] for m in modules)
    has_source = sum(1 for m in modules if m["has_source"])
    print(f"扫描完成: {len(modules)} 个模块, {has_source} 个有源码, {total_files} 个源文件")
    print(f"项目类型: {project_type['platform']} / {project_type['build']}")
    print(f"输出: {output_path}")
    if args.lightweight:
        print("(轻量模式：跳过文件列表/目录/资源扫描，仅保留模块元数据和依赖)")

    if not SCAN_OUTPUT.exists() or args.output:
        print(f"\n下一步: AI 读取 {output_path} + 各模块源码 → 生成完整参考文档")
    else:
        print(f"\n提示: 如需增量更新，运行 python gen_references.py --diff")


def _current_time():
    """返回当前时间戳字符串"""
    from datetime import datetime
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")


if __name__ == "__main__":
    main()
